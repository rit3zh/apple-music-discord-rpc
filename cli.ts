#!/usr/bin/env bun
import { loadConfig, saveConfig, CONFIG_PATH, type IConfig } from "./config.js";

const args = process.argv.slice(2);
const command = args[0];

const CONFIGURABLE_FIELDS = [
  "activity-name",
  "large-text",
  "small-image",
  "small-text",
  "gif-fps",
  "gif-scale",
  "gif-duration",
  "gif-colors",
] as const;
type ConfigurableField = (typeof CONFIGURABLE_FIELDS)[number];

const FIELD_KEY_MAP: Record<ConfigurableField, keyof IConfig> = {
  "activity-name": "activityName",
  "large-text": "largeText",
  "small-image": "smallImage",
  "small-text": "smallText",
  "gif-fps": "gifFps",
  "gif-scale": "gifScale",
  "gif-duration": "gifDuration",
  "gif-colors": "gifColors",
};

const NUMERIC_FIELDS = new Set<ConfigurableField>([
  "gif-fps",
  "gif-scale",
  "gif-duration",
  "gif-colors",
]);

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

switch (command) {
  case "set-key": {
    const key = args[1];
    if (!key) {
      console.error("Usage: apple-music-rpc set-key <api-key>");
      process.exit(1);
    }
    const config = loadConfig();
    config.imgbbKey = key;
    saveConfig(config);
    console.log("ImgBB API key saved.");
    break;
  }

  case "get-key": {
    const config = loadConfig();
    if (!config.imgbbKey) {
      console.log("No API key set. Run: apple-music-rpc set-key <key>");
    } else {
      console.log(`ImgBB API key: ${maskKey(config.imgbbKey)}`);
    }
    break;
  }

  case "remove-key": {
    const config = loadConfig();
    delete config.imgbbKey;
    saveConfig(config);
    console.log("ImgBB API key removed. Animated artwork will be disabled.");
    break;
  }

  case "set": {
    const field = args[1] as ConfigurableField;
    const value = args.slice(2).join(" ");

    if (!field || !value) {
      console.error("Usage: apple-music-rpc set <field> <value>");
      console.error(`Fields: ${CONFIGURABLE_FIELDS.join(", ")}`);
      process.exit(1);
    }

    if (!CONFIGURABLE_FIELDS.includes(field)) {
      console.error(`Unknown field: ${field}`);
      console.error(`Available fields: ${CONFIGURABLE_FIELDS.join(", ")}`);
      process.exit(1);
    }

    if (field === "small-image" && value.startsWith("http")) {
      try {
        new URL(value);
      } catch {
        console.error(`Invalid URL: "${value}"`);
        process.exit(1);
      }
    }

    const config = loadConfig();
    (config as any)[FIELD_KEY_MAP[field]] =
      NUMERIC_FIELDS.has(field) ? Number(value) : value;
    saveConfig(config);
    console.log(`Set ${field} = "${value}"`);
    break;
  }

  case "get": {
    const field = args[1] as ConfigurableField;
    if (!field) {
      console.error("Usage: apple-music-rpc get <field>");
      console.error(`Fields: ${CONFIGURABLE_FIELDS.join(", ")}`);
      process.exit(1);
    }
    const config = loadConfig();
    const key = FIELD_KEY_MAP[field];
    console.log(`${field} = "${config[key]}"`);
    break;
  }

  case "config": {
    const config = loadConfig();
    console.log("Current configuration:");
    console.log(
      `  imgbb-key:   ${config.imgbbKey ? maskKey(config.imgbbKey) : "(not set — animated artwork disabled)"}`,
    );
    console.log(`  activity-name: "${config.activityName}"`);
    console.log(`  large-text:   "${config.largeText}"`);
    console.log(`  small-image:  "${config.smallImage}"`);
    console.log(`  small-text:   "${config.smallText}"`);
    console.log(`  gif-fps:      ${config.gifFps}`);
    console.log(`  gif-scale:    ${config.gifScale}`);
    console.log(`  gif-duration: ${config.gifDuration}s`);
    console.log(`  gif-colors:   ${config.gifColors}`);
    console.log(`\nConfig file: ${CONFIG_PATH}`);
    console.log("\nTemplate variables: {album}, {artist}, {title}");
    break;
  }

  case "start": {
    const { spawn } = await import("child_process");
    const indexPath = new URL("./index.ts", import.meta.url).pathname;
    spawn("bun", [indexPath], { stdio: "inherit", detached: false });
    break;
  }

  default: {
    console.log(`apple-music-rpc — Apple Music Discord Rich Presence

Usage:
  apple-music-rpc start                      Start the rich presence daemon
  apple-music-rpc set-key <key>              Set ImgBB API key (enables animated artwork)
  apple-music-rpc get-key                    Show current ImgBB API key (masked)
  apple-music-rpc remove-key                 Remove ImgBB API key
  apple-music-rpc set <field> <value>        Set a config value
  apple-music-rpc get <field>                Get a config value
  apple-music-rpc config                     Show all configuration

Configurable fields:
  activity-name  Discord activity name    (supports {album}, {artist}, {title})
  large-text     Hover text on album art  (supports {album}, {artist}, {title})
  small-image    Small icon key or URL    (Discord asset name)
  small-text     Hover text on small icon
  gif-fps        Framerate of animated art  (default: 15, quality: 30)
  gif-scale      Width in pixels            (default: 240, quality: 320)
  gif-duration   Seconds to capture        (default: 4)
  gif-colors     Palette size 2-256        (default: 128, quality: 256)

Examples:
  apple-music-rpc set-key abc123
  apple-music-rpc set gif-fps 30
  apple-music-rpc set gif-scale 320
  apple-music-rpc set gif-colors 256
  apple-music-rpc config`);
    break;
  }
}
