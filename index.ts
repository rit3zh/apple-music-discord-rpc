import { execSync } from "child_process";
import { unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Client as DiscordClient, ActivityType } from "discord-rpc-new";
import { Client as Scraper } from "./client.js";
import { m3u8ToGif, uploadToImgbb, deleteFromImgbb } from "./covers.js";
import { loadConfig } from "./config.js";

const DISCORD_CLIENT_ID = "1479188395447287928";
const POLL_INTERVAL_MS = 5000;
const ANIMATED_ART_DELAY_MS = 3000;

interface MediaInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  position: number;
}

interface iTunesResult {
  artworkUrl100?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
}

const discord = new DiscordClient();
const scraper = new Scraper();

let lastTrackKey = "";
let staticArtwork: string | undefined;
let cachedTrackUrl = "https://music.apple.com";
let animatedArtTimer: ReturnType<typeof setTimeout> | null = null;

const albumGifCache = new Map<string, { gifUrl: string; deleteUrl: string }>();
let lastUploadDeleteUrl: string | null = null;

function getCurrentlyPlaying(): MediaInfo | null {
  try {
    const raw = execSync("media-control get --now", {
      encoding: "utf-8",
      timeout: 3000,
    });

    const data = JSON.parse(raw.trim());

    if (!data.isMusicApp && data.bundleIdentifier !== "com.apple.Music")
      return null;

    if (!data.playing) return null;

    return {
      title: data.title ?? "Unknown Song",
      artist: data.artist ?? "Unknown Artist",
      album: data.album ?? "Unknown Album",
      duration: data.duration ?? 0,
      position: data.elapsedTimeNow ?? 0,
    };
  } catch {
    return null;
  }
}

async function fetchiTunesData(song: MediaInfo): Promise<iTunesResult> {
  const query = encodeURIComponent(`${song.artist} ${song.title}`);
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`,
    );
    const json = (await res.json()) as { results?: iTunesResult[] };
    if (json.results?.length) return json.results[0]!;
  } catch {}
  return {};
}

function resolveTemplate(template: string, song: MediaInfo): string {
  return template
    .replace("{album}", song.album)
    .replace("{artist}", song.artist)
    .replace("{title}", song.title);
}

async function setPresence(
  song: MediaInfo,
  artworkUrl: string | undefined,
): Promise<void> {
  const config = loadConfig();
  const startTimestamp = Date.now() - song.position * 1000;
  const endTimestamp = startTimestamp + song.duration * 1000;

  await discord.setActivity({
    type: ActivityType.Listening,
    ...({ name: resolveTemplate(config.activityName, song) } as any),
    details: song.title,
    state: `${song.artist} • ${song.album}`,
    timestamps: { start: startTimestamp, end: endTimestamp },
    assets: {
      large_image: artworkUrl,
      large_text: resolveTemplate(config.largeText, song),
      small_image: config.smallImage || undefined,
      small_text: config.smallText || undefined,
    },
    buttons: [
      {
        label: "Listen on Apple Music",
        url: cachedTrackUrl,
      },
    ],
  });
}

async function fetchAnimatedArt(
  song: MediaInfo,
  collectionViewUrl: string,
): Promise<void> {
  const config = loadConfig();
  if (!config.imgbbKey) return;

  const albumKey = `${song.artist}|||${song.album}`;

  const cached = albumGifCache.get(albumKey);
  if (cached) {
    const current = getCurrentlyPlaying();
    await setPresence(current ?? song, cached.gifUrl);
    return;
  }

  try {
    const { m3u8Url } = await scraper.getAlbum(collectionViewUrl);
    if (!m3u8Url) return;

    const tmpPath = join(tmpdir(), `am-rpc-${Date.now()}.gif`);
    await m3u8ToGif(m3u8Url, tmpPath, {
      fps: config.gifFps,
      scale: config.gifScale,
      duration: config.gifDuration,
      colors: config.gifColors,
    });

    const { url: gifUrl, deleteUrl } = await uploadToImgbb(
      tmpPath,
      config.imgbbKey,
    );
    if (
      lastUploadDeleteUrl &&
      lastUploadDeleteUrl !== albumGifCache.get(albumKey)?.deleteUrl
    ) {
      deleteFromImgbb(lastUploadDeleteUrl).catch(() => {});
    }
    albumGifCache.set(albumKey, { gifUrl, deleteUrl });
    lastUploadDeleteUrl = deleteUrl;

    await unlink(tmpPath).catch(() => {});

    const current = getCurrentlyPlaying();
    if (
      current &&
      `${current.artist}-${current.title}` === `${song.artist}-${song.title}`
    ) {
      await setPresence(current, gifUrl);
    }
  } catch {}
}

async function updatePresence(): Promise<void> {
  const song = getCurrentlyPlaying();

  if (!song) {
    discord.clearActivity()?.catch(() => {});
    return;
  }

  const trackKey = `${song.artist}-${song.title}`;

  if (trackKey !== lastTrackKey) {
    if (animatedArtTimer) {
      clearTimeout(animatedArtTimer);
      animatedArtTimer = null;
    }

    lastTrackKey = trackKey;
    const itunes = await fetchiTunesData(song);
    staticArtwork = itunes.artworkUrl100?.replace("100x100bb", "512x512bb");
    cachedTrackUrl = itunes.trackViewUrl ?? "https://music.apple.com";
    await setPresence(song, staticArtwork);
    if (itunes.collectionViewUrl) {
      const collectionUrl = itunes.collectionViewUrl;
      animatedArtTimer = setTimeout(async () => {
        const current = getCurrentlyPlaying();
        if (current && `${current.artist}-${current.title}` === trackKey) {
          await fetchAnimatedArt(song, collectionUrl);
        }
      }, ANIMATED_ART_DELAY_MS);
    }
  } else {
    const albumKey = `${song.artist}|||${song.album}`;
    const art = albumGifCache.get(albumKey)?.gifUrl ?? staticArtwork;
    await setPresence(song, art);
  }
}

async function start(): Promise<void> {
  const res = await discord.login({ clientId: DISCORD_CLIENT_ID });
  console.log(`Connected as ${res.user.username}`);

  await updatePresence();
  setInterval(updatePresence, POLL_INTERVAL_MS);
}

async function shutdown(): Promise<void> {
  console.log("Shutting down...");
  await discord.destroy();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch(console.error);
