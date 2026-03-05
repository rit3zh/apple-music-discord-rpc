# apple-music-discord-rpc

Apple Music rich presence for Discord, built with Bun.

<br />

<img src="Screenshot 2026-03-06 at 1.54.06 AM.png" width="320" />

<br />

## Install via Homebrew

```sh
brew install https://raw.githubusercontent.com/rit3zh/apple-music-discord-rpc/main/Formula/apple-music-discord-rpc.rb
brew services start apple-music-discord-rpc
```

## Requirements

- [media-control](https://github.com/nicholasgasior/media-control) — install via:
  ```sh
  brew install media-control
  ```
- Discord desktop app running

## Manual Setup

```sh
git clone https://github.com/rit3zh/apple-music-discord-rpc
cd apple-music-discord-rpc
bun install
bun index.ts
```

## Notes

> Discord hides RPC buttons from yourself — other users viewing your profile can see and click them.
