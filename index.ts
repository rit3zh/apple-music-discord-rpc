import { execSync } from "child_process";
import { Client, ActivityType } from "discord-rpc-new";

const CLIENT_ID = "1479188395447287928";
const POLL_INTERVAL_MS = 5000;

interface MediaInfo {
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  duration: number;
  position: number;
}

interface iTunesResult {
  artworkUrl100?: string;
  trackViewUrl?: string;
}

const client = new Client();

let lastTrack = "";
let cachedArtwork: string | undefined;
let cachedTrackUrl = "https://music.apple.com";

function getCurrentlyPlaying(): MediaInfo | null {
  try {
    const raw = execSync("media-control get --now", {
      encoding: "utf-8",
      timeout: 3000,
    });

    const data = JSON.parse(raw.trim());

    return {
      title: data.title ?? "Unknown Song",
      artist: data.artist ?? "Unknown Artist",
      album: data.album ?? "Unknown Album",
      isPlaying: data.playing ?? false,
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

async function updatePresence() {
  const song = getCurrentlyPlaying();

  if (!song?.isPlaying) {
    client.clearActivity();
    return;
  }

  const trackKey = `${song.artist}-${song.title}`;

  if (trackKey !== lastTrack) {
    const itunes = await fetchiTunesData(song);
    cachedArtwork = itunes.artworkUrl100?.replace("100x100bb", "512x512bb");
    cachedTrackUrl = itunes.trackViewUrl ?? "https://music.apple.com";
    lastTrack = trackKey;
  }

  const startTimestamp = Date.now() - song.position * 1000;
  const endTimestamp = startTimestamp + song.duration * 1000;

  await client.setActivity({
    type: ActivityType.Listening,
    ...({ name: song.title } as any),

    details: song.title,
    state: `${song.artist} • ${song.album}`,
    timestamps: { start: startTimestamp, end: endTimestamp },
    assets: {
      large_image: cachedArtwork,
      large_text: song.album,
      small_image: "lossless-main",
      small_text: "Lossless Audio on Apple Music",
    },
    buttons: [
      {
        label: "Listen on Apple Music",
        url: cachedTrackUrl,
      },
    ],
  });
}

async function start() {
  const res = await client.login({ clientId: CLIENT_ID });
  console.log(`Connected as ${res.user.username}`);

  await updatePresence();
  setInterval(updatePresence, POLL_INTERVAL_MS);
}

async function shutdown() {
  console.log("Shutting down...");
  await client.destroy();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
