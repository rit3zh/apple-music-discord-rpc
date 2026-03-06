import axios, { type AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import { USER_AGENTS } from "./headers.js";
import { randomizeHeaders } from "./utils.js";
import type { IClientOptions } from "./typings.js";

class Client {
  private readonly http: AxiosInstance;
  private readonly agentType: "desktop" | "mobile";

  constructor(options: IClientOptions = {}) {
    this.agentType = options.agentType ?? "desktop";
    this.http = axios.create({
      timeout: options.timeout ?? 10_000,
      headers: { "Accept-Encoding": "gzip, deflate, br" },
    });
  }

  private randomAgent(): string {
    const pool = USER_AGENTS[this.agentType] ?? USER_AGENTS.desktop!;
    return pool[Math.floor(Math.random() * pool.length)]!;
  }

  private buildHeaders(): Record<string, string> {
    const base: Record<string, string> = {
      "User-Agent": this.randomAgent(),
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    };

    return randomizeHeaders(base);
  }

  async fetch(url: string): Promise<string> {
    const { data } = await this.http.get<string>(url, {
      headers: this.buildHeaders(),
      responseType: "text",
    });
    return data;
  }

  async getAlbum(url: string): Promise<{ m3u8Url: string | null }> {
    const html = await this.fetch(url);
    const $ = cheerio.load(html);
    const m3u8Url = $("amp-ambient-video").attr("src") ?? null;
    return { m3u8Url };
  }
}

export { Client };
