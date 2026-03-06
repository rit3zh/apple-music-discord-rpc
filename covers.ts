import { execSync } from "child_process";
import { readFileSync } from "fs";
import axios from "axios";

export interface GifOptions {
  fps: number;
  scale: number;
  duration: number;
  colors: number;
}

export async function m3u8ToGif(
  m3u8Url: string,
  outputPath: string,
  opts: GifOptions,
): Promise<void> {
  execSync(
    `ffmpeg -y -probesize 32 -analyzeduration 0 -t ${opts.duration} -i "${m3u8Url}" -vf "fps=${opts.fps},scale=${opts.scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${opts.colors}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" -loop 0 "${outputPath}"`,
    { timeout: 30_000, stdio: "pipe" },
  );
}

export async function uploadToImgbb(
  filePath: string,
  apiKey: string,
): Promise<{ url: string; deleteUrl: string; id: string }> {
  const imageBase64 = readFileSync(filePath).toString("base64");
  const params = new URLSearchParams();
  params.append("key", apiKey);
  params.append("image", imageBase64);

  const { data } = await axios.post<{
    data: { url: string; delete_url: string; id: string };
    success: boolean;
  }>("https://api.imgbb.com/1/upload", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    maxBodyLength: Infinity,
  });

  if (!data.success) throw new Error("imgbb upload failed");

  return {
    url: data.data.url,
    deleteUrl: data.data.delete_url,
    id: data.data.id,
  };
}

export async function deleteFromImgbb(deleteUrl: string): Promise<void> {
  await axios.get(deleteUrl).catch(() => {});
}
