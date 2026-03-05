class MusicDiscordRpc < Formula
  desc "Apple Music rich presence for Discord"
  homepage "https://github.com/YOUR_USERNAME/apple-music-discord-rpc"
  url "https://github.com/YOUR_USERNAME/apple-music-discord-rpc/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "REPLACE_WITH_SHA256_AFTER_TAGGING"
  license "MIT"

  depends_on "oven-sh/bun/bun"

  service do
    run [opt_bin/"music-discord-rpc"]
    keep_alive true
    log_path var/"log/music-discord-rpc.log"
    error_log_path var/"log/music-discord-rpc.log"
    process_type :background
  end

  def install
    libexec.install Dir["*"]

    system Formula["oven-sh/bun/bun"].opt_bin/"bun", "install",
           "--production", "--frozen-lockfile",
           chdir: libexec

    (bin/"music-discord-rpc").write <<~SH
      #!/bin/bash
      exec "#{Formula["oven-sh/bun/bun"].opt_bin}/bun" "#{libexec}/index.ts" "$@"
    SH
  end

  test do
    assert_predicate bin/"music-discord-rpc", :exist?
  end
end
