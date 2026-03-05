class AppleMusicDiscordRpc < Formula
  desc "Apple Music rich presence for Discord"
  homepage "https://github.com/rit3zh/apple-music-discord-rpc"
  url "https://github.com/rit3zh/apple-music-discord-rpc/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "002f3a1bfb201bc2059277f1eab5e7597aae78f562e2b44ed6a8670db2acf9f9"
  license "MIT"

  depends_on "oven-sh/bun/bun"

  service do
    run [opt_bin/"apple-music-discord-rpc"]
    keep_alive true
    log_path var/"log/apple-music-discord-rpc.log"
    error_log_path var/"log/apple-music-discord-rpc.log"
    process_type :background
  end

  def install
    libexec.install Dir["*"]

    system Formula["oven-sh/bun/bun"].opt_bin/"bun", "install",
           "--production", "--frozen-lockfile",
           chdir: libexec

    (bin/"apple-music-discord-rpc").write <<~SH
      #!/bin/bash
      exec "#{Formula["oven-sh/bun/bun"].opt_bin}/bun" "#{libexec}/index.ts" "$@"
    SH
  end

  test do
    assert_predicate bin/"apple-music-discord-rpc", :exist?
  end
end
