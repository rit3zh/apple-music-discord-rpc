# Apple Music Discord RPC

Apple Music rich presence for Discord, built with Bun.

---

## 🚀 Features

- Show the currently playing Apple Music track on Discord.
- Display track info like **title**, **artist**, and **album**.
- Rich presence buttons (visible to other users, not yourself).

---

## 💾 Installation

### Via Homebrew (Recommended)

```sh
brew tap rit3zh/tap
brew install apple-music-discord-rpc
brew services start apple-music-discord-rpc
```

### Manual Setup

```sh
git clone https://github.com/rit3zh/apple-music-discord-rpc
cd apple-music-discord-rpc
bun install
bun index.ts
```

---

## How it looks

<img width="645" height="363" alt="Screenshot of Apple Music Discord RPC" src="https://github.com/user-attachments/assets/78d8020a-64ae-47e5-a196-3e2434c53618" />

---

## 🛠 Requirements

- [**media-control**](https://github.com/nicholasgasior/media-control) — Install via Homebrew:

```sh
brew install media-control
```

- Discord desktop app running

> **Note:** Discord hides RPC buttons from yourself. Other users can see and interact with them on your profile.

---

## 📌 Notes

- Designed for macOS with Apple Music.
- Built with **Bun** for fast execution and minimal setup.
