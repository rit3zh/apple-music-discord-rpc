# 🍎 Apple Music Discord RPC

![Bun](https://img.shields.io/badge/Bun-1.0-orange?logo=bun\&logoColor=white) ![macOS](https://img.shields.io/badge/macOS-Compatible-999?logo=apple\&logoColor=white) ![Discord](https://img.shields.io/badge/Discord-RPC-blue?logo=discord\&logoColor=white)

Apple Music rich presence for Discord, built with **Bun**. Display your currently playing Apple Music track on Discord with rich presence buttons.

---

## 🎬 Preview

Check out the installation & usage preview:

[![Installation & Demo](https://github.com/user-attachments/assets/b1afed6f-a7a3-4d72-a1ac-5d66a89ec95b)](https://github.com/user-attachments/assets/b1afed6f-a7a3-4d72-a1ac-5d66a89ec95b)

---

## 🚀 Features

* Show currently playing Apple Music track on Discord.
* Display track information: **title**, **artist**, **album**.
* Rich presence buttons (visible to other users, not yourself).
* Lightweight & fast, powered by **Bun**.

---

## 💾 Installation

### ✅ Via Homebrew (Recommended)

```sh
brew tap rit3zh/tap
brew install apple-music-discord-rpc
brew services start apple-music-discord-rpc
```

### 🛠 Manual Setup

```sh
git clone https://github.com/rit3zh/apple-music-discord-rpc
cd apple-music-discord-rpc
bun install
bun index.ts
```

---

## 📸 Screenshots

<img width="645" height="363" alt="Apple Music Discord RPC Screenshot" src="https://github.com/user-attachments/assets/78d8020a-64ae-47e5-a196-3e2434c53618" />

---

## 🛠 Requirements

* [**media-control**](https://github.com/nicholasgasior/media-control) — Install via Homebrew:

```sh
brew install media-control
```

* Discord desktop app running

> **Note:** Discord hides RPC buttons from yourself. Other users can see and interact with them on your profile.

---

## 📌 Notes

* Designed for **macOS** with Apple Music.
* Built with **Bun** for minimal setup and fast execution.
