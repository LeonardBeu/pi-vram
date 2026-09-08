# pi-vram-extension

Shows current GPU VRAM usage in the pi footer, e.g.:

```
VRAM 10.8GB/16.3GB
```

- Refreshes every 5 seconds via `nvidia-smi` (NVIDIA only)
- Multi-GPU: one reading per GPU, space separated
- Color by load on the hottest GPU: normal < 80%, warning ≥ 80%, red ≥ 95%
- If nvidia-smi is missing or fails (no NVIDIA GPU), the status line is hidden — no errors shown
- Zero runtime dependencies

## Install

```bash
pi install npm:pi-vram-extension
```

Or locally from a checkout:

```bash
pi install /absolute/path/to/this-folder
# temporary, one run only:
pi -e /absolute/path/to/this-folder
```

## Notes

- Requires an NVIDIA GPU with `nvidia-smi` on PATH (Windows and Linux both work).
- Each refresh spawns a short `nvidia-smi` process (~5s interval by default).
