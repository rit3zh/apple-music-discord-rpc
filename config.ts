import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface IConfig {
  imgbbKey?: string;
  activityName: string;
  largeText: string;
  smallImage: string;
  smallText: string;
  gifFps: number;
  gifScale: number;
  gifDuration: number;
  gifColors: number;
}

const CONFIG_DIR = join(homedir(), ".config", "apple-music-discord-rpc");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: IConfig = {
  activityName: "{title}",
  largeText: "{album}",
  smallImage: "lossless-main",
  smallText: "Lossless Audio on Apple Music",
  gifFps: 15,
  gifScale: 240,
  gifDuration: 4,
  gifColors: 128,
};

export function loadConfig(): IConfig {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return { ...DEFAULT_CONFIG, ...raw };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: IConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export { CONFIG_PATH };
