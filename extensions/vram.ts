import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { execFile } from "node:child_process";

const REFRESH_MS = 5000;
const STATUS_KEY = "vram";

/** Query all GPUs. Returns raw CSV or null if nvidia-smi is missing/fails. */
function queryVram(): Promise<string | null> {
	return new Promise((resolve) => {
		execFile(
			"nvidia-smi",
			["--query-gpu=memory.used,memory.total", "--format=csv,noheader"],
			{ timeout: 4000 },
			(err, stdout) => resolve(err ? null : stdout),
		);
	});
}

/** Parse nvidia-smi CSV into labels like "10.8GB/16.3GB" (one per GPU). */
function parseVram(csv: string): { parts: string[]; pct: number } | undefined {
	const gpus = csv
		.trim()
		.split(/\r?\n/)
		.map((line) => line.split(","))
		.filter((parts) => parts.length >= 2)
		.map((parts) => ({
			usedMiB: Number.parseFloat(parts[0]!.replace(/[^0-9.]/g, "")),
			totalMiB: Number.parseFloat(parts[1]!.replace(/[^0-9.]/g, "")),
		}))
		.filter((g) => Number.isFinite(g.usedMiB) && Number.isFinite(g.totalMiB));

	if (gpus.length === 0) return undefined;

	const parts = gpus.map(
		(g) => `${(g.usedMiB / 1024).toFixed(1)}GB/${(g.totalMiB / 1024).toFixed(1)}GB`,
	);
	// Color by the hottest GPU's usage.
	const pct = Math.max(...gpus.map((g) => g.usedMiB / g.totalMiB));
	return { parts, pct };
}

export default function (pi: ExtensionAPI) {
	let timer: ReturnType<typeof setInterval> | undefined;

	function stop() {
		if (!timer) return;
		clearInterval(timer);
		timer = undefined;
	}

	async function refresh(ctx: ExtensionContext) {
		const csv = await queryVram();
		if (!ctx.hasUI || ctx.mode !== "tui") return; // headless mode, nothing to show
		ctx.ui.setStatus(STATUS_KEY, undefined);
		const info = csv ? parseVram(csv) : undefined;
		if (info) {
			const color = info.pct >= 0.95 ? "error" : info.pct >= 0.8 ? "warning" : "muted";
			ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg(color, `VRAM ${info.parts.join(" ")}`));
		}
	}

	pi.on("session_start", async (_event, ctx) => {
		stop(); // idempotent across reload/new/resume
		timer = setInterval(() => void refresh(ctx), REFRESH_MS);
		await refresh(ctx);
	});

	pi.on("session_shutdown", () => stop());
}
