#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUN="$(command -v bun || echo "/opt/homebrew/bin/bun")"
INSTALL_NAME="music-discord-rpc"
BIN_PATH="/usr/local/bin/$INSTALL_NAME"
PLIST_LABEL="com.$INSTALL_NAME"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_LABEL.plist"
LOG_PATH="$HOME/Library/Logs/$INSTALL_NAME.log"

# ─── Commands ─────────────────────────────────────────────────────────────────

cmd_install() {
  echo "Installing $INSTALL_NAME..."

  # Install dependencies
  cd "$SCRIPT_DIR"
  "$BUN" install --production

  # Write the wrapper script
  sudo tee "$BIN_PATH" > /dev/null <<EOF
#!/usr/bin/env bash
exec "$BUN" "$SCRIPT_DIR/index.ts" "\$@"
EOF
  sudo chmod +x "$BIN_PATH"

  # Write the launchd plist
  mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
  cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$PLIST_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$BUN</string>
    <string>$SCRIPT_DIR/index.ts</string>
  </array>
  <key>RunAtLoad</key>
  <false/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_PATH</string>
  <key>StandardErrorPath</key>
  <string>$LOG_PATH</string>
</dict>
</plist>
EOF

  echo "Installed! Run '$INSTALL_NAME enable' to start."
}

cmd_uninstall() {
  echo "Uninstalling $INSTALL_NAME..."
  cmd_disable 2>/dev/null || true
  sudo rm -f "$BIN_PATH"
  rm -f "$PLIST_PATH"
  echo "Uninstalled."
}

cmd_enable() {
  if launchctl list | grep -q "$PLIST_LABEL"; then
    echo "Already running."
    return
  fi
  launchctl load "$PLIST_PATH"
  echo "Started. Logs: $LOG_PATH"
}

cmd_disable() {
  if ! launchctl list | grep -q "$PLIST_LABEL"; then
    echo "Not running."
    return
  fi
  launchctl unload "$PLIST_PATH"
  echo "Stopped."
}

cmd_status() {
  if launchctl list | grep -q "$PLIST_LABEL"; then
    echo "Running"
  else
    echo "Stopped"
  fi
}

cmd_logs() {
  tail -f "$LOG_PATH"
}

# ─── Entry point ──────────────────────────────────────────────────────────────

case "${1:-}" in
  install)   cmd_install ;;
  uninstall) cmd_uninstall ;;
  enable)    cmd_enable ;;
  disable)   cmd_disable ;;
  status)    cmd_status ;;
  logs)      cmd_logs ;;
  *)
    echo "Usage: $0 {install|uninstall|enable|disable|status|logs}"
    exit 1
    ;;
esac
