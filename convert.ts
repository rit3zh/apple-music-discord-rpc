import { spawn } from "child_process";

export function m3u8ToGif(input: string, output: string) {
  return new Promise<void>((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      input,
      "-vf",
      "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      output,
    ];

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}
