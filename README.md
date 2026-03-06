# Apple Music Discord RPC

![Bun](https://img.shields.io/badge/Bun-1.0-orange?logo=bun\&logoColor=white) ![macOS](https://img.shields.io/badge/macOS-Compatible-999?logo=apple\&logoColor=white) ![Discord](https://img.shields.io/badge/Discord-RPC-blue?logo=discord\&logoColor=white)

Apple Music rich presence for Discord — shows your currently playing track with animated album artwork, built with Bun.

---

## Preview

[![Installation & Demo](https://github.com/user-attachments/assets/b1afed6f-a7a3-4d72-a1ac-5d66a89ec95b)](https://github.com/user-attachments/assets/b1afed6f-a7a3-4d72-a1ac-5d66a89ec95b)

<img width="645" height="363" alt="Screenshot of Apple Music Discord RPC" src="https://github.com/user-attachments/assets/78d8020a-64ae-47e5-a196-3e2434c53618" />

---

## Features

- Currently playing track with **title**, **artist**, and **album**
- Animated album artwork via ImgBB (optional — falls back to static art gracefully)
- Apple Music **only** — ignores Spotify, YouTube, and other sources
- Live progress bar with start/end timestamps
- "Listen on Apple Music" button (visible to others on your profile)
- Fully configurable via CLI — artwork quality, text, icons, and more

---

## Installation

### Via Homebrew (Recommended)

```sh
brew tap rit3zh/tap
brew install apple-music-discord-rpc
brew services start apple-music-discord-rpc
```

### Manual

```sh
git clone https://github.com/rit3zh/apple-music-discord-rpc
cd apple-music-discord-rpc
bun install
bun index.ts
```

---

## Requirements

- macOS with Apple Music
- Discord desktop app running
- [media-control](https://github.com/nicholasgasior/media-control):

```sh
brew install media-control
```

- `ffmpeg` (only needed for animated artwork):

```sh
brew install ffmpeg
```

---

## Setup

### Animated Artwork (Optional)

Animated artwork is fetched from Apple Music, converted to a GIF, and hosted on [ImgBB](https://imgbb.com). Without a key, static iTunes artwork is used instead — no errors, no crashes.

1. Get a free API key at [api.imgbb.com](https://api.imgbb.com)
2. Set it:

```sh
apple-music-rpc set-key YOUR_API_KEY
```

---

## CLI Reference

```
apple-music-rpc start                   Start the rich presence daemon
apple-music-rpc set-key <key>           Set ImgBB API key (enables animated artwork)
apple-music-rpc get-key                 Show current ImgBB API key (masked)
apple-music-rpc remove-key             Remove ImgBB API key
apple-music-rpc set <field> <value>    Set a config value
apple-music-rpc get <field>            Get a config value
apple-music-rpc config                 Show all current configuration
```

---

## Configuration

Run `apple-music-rpc config` to see all current values.

### Presence

| Field | Default | Description |
|---|---|---|
| `activity-name` | `{title}` | Discord activity name. Supports `{album}`, `{artist}`, `{title}` |
| `large-text` | `{album}` | Hover text on album art. Supports `{album}`, `{artist}`, `{title}` |
| `small-image` | `lossless-main` | Small icon — Discord asset name or a valid image URL |
| `small-text` | `Lossless Audio on Apple Music` | Hover text on the small icon |

### Animated Artwork

| Field | Default | Description |
|---|---|---|
| `gif-fps` | `15` | Framerate. Higher = smoother, slower to generate |
| `gif-scale` | `240` | Width in pixels. Higher = sharper, larger file |
| `gif-duration` | `4` | Seconds of video to capture |
| `gif-colors` | `128` | Palette size (2–256). Higher = better colors |

**Presets:**

```sh
# Fastest (default)
apple-music-rpc set gif-fps 15
apple-music-rpc set gif-scale 240
apple-music-rpc set gif-colors 128

# Balanced
apple-music-rpc set gif-fps 24
apple-music-rpc set gif-scale 320
apple-music-rpc set gif-colors 192

# Quality
apple-music-rpc set gif-fps 30
apple-music-rpc set gif-scale 480
apple-music-rpc set gif-colors 256
```

### Examples

```sh
apple-music-rpc set activity-name "Apple Music"
apple-music-rpc set large-text "{album} — {artist}"
apple-music-rpc set small-text "Hi-Res Lossless"
apple-music-rpc set small-image "https://i.imgur.com/example.png"
```

---

## Notes

- Discord hides RPC buttons from yourself — other users can see and click them
- Animated artwork requires an ImgBB API key; without one, static artwork is used silently
- The daemon is Apple Music exclusive — other media apps are ignored entirely
