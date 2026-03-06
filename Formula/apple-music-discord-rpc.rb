class AppleMusicDiscordRpc < Formula
  desc "Apple Music rich presence for Discord"
  homepage "https://github.com/rit3zh/apple-music-discord-rpc"
  url "https://github.com/rit3zh/apple-music-discord-rpc/archive/refs/tags/v1.1.0.tar.gz"
  sha256 "e8e4eb1b601561a803a82574737d31db185899aea54b564f54f1bcf141e22544"
  license "MIT"

  depends_on "oven-sh/bun/bun"
  depends_on "ffmpeg"

  service do
    run [opt_bin/"apple-music-discord-rpc"]
    keep_alive true
    log_path var/"log/apple-music-discord-rpc.log"
    error_log_path var/"log/apple-music-discord-rpc.log"
    process_type :background
  end

  def install
    libexec.install Dir["*"]

    cd libexec do
      system Formula["oven-sh/bun/bun"].opt_bin/"bun", "install",
             "--production", "--frozen-lockfile"
    end

    (bin/"apple-music-discord-rpc").write <<~SH
      #!/bin/bash
      export TMPDIR=$(getconf DARWIN_USER_TEMP_DIR)
      export PATH="#{HOMEBREW_PREFIX}/bin:#{HOMEBREW_PREFIX}/sbin:/usr/local/bin:/usr/bin:/bin:$PATH"
      exec "#{Formula["oven-sh/bun/bun"].opt_bin}/bun" "#{libexec}/index.ts" "$@"
    SH

    (bin/"apple-music-rpc").write <<~SH
      #!/bin/bash
      export TMPDIR=$(getconf DARWIN_USER_TEMP_DIR)
      export PATH="#{HOMEBREW_PREFIX}/bin:#{HOMEBREW_PREFIX}/sbin:/usr/local/bin:/usr/bin:/bin:$PATH"
      exec "#{Formula["oven-sh/bun/bun"].opt_bin}/bun" "#{libexec}/cli.ts" "$@"
    SH
  end

  test do
    assert_predicate bin/"apple-music-discord-rpc", :exist?
  end
end
