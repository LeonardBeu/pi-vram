# pi-vram-extension

Footer widget for the [pi coding agent](https://github.com/earendil-works/pi) that shows how much GPU VRAM is in use, so you can see at a glance what your **local models** are eating while you work.

If you run local LLMs (llama.cpp, vLLM, LM Studio, Ollama, …) on the same machine as pi, this tells you exactly how full your card is:

```
VRAM 10.8GB/16.3GB
```

- Refreshes every 5 seconds via `nvidia-smi` (NVIDIA only)
- Multi-GPU systems show one reading per GPU, space separated
- Color changes with load on the hottest GPU: normal below 80%, warning at 80%+, red at 95%+ — so you know when your model is about to OOM
- If `nvidia-smi` is missing or fails (no NVIDIA GPU), the status line simply hides — no errors shown
- Zero runtime dependencies

## Install

```bash
pi install npm:pi-vram-extension          # from npm (once published)
pi install git:github.com/LeonardBeu/pi-vram@main   # straight from this repo
```

Or locally from a checkout:

```bash
pi install /absolute/path/to/this-folder
# temporary, one run only:
pi -e /absolute/path/to/this-folder
```

After installing, the reading appears in pi's footer row next to other status items. Run `/reload` in an open session or start pi fresh after first install.

## Notes

- Requires an NVIDIA GPU with `nvidia-smi` on PATH (Windows and Linux both work). AMD/Intel GPUs are not supported — nvidia-smi only sees NVIDIA cards.
- "Used" is total VRAM reserved by everything on the card: your model weights + KV cache, plus any other process (browsers, games, etc.). If you load a 14B Q4 model and see ~9GB used with nothing else running, that's roughly your footprint.
- Each refresh spawns a short-lived `nvidia-smi` process (~every 5s) — cheap, but not free.
