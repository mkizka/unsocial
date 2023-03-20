#!/usr/bin/bash
set -eu

echo "Install local CA and copy to ./docker/mkcert"
mkcert -install 2>/dev/null
mkdir -p docker/mkcert 2>/dev/null
cp "$(mkcert -CAROOT)"/rootCA.pem ./docker/mkcert/
echo "Done"

echo "Generte cert files to ./docker/nginx/certs"
mkdir -p docker/nginx/certs
mkcert -cert-file docker/nginx/certs/misskey.crt -key-file docker/nginx/certs/misskey.key misskey.localhost 2>/dev/null
mkcert -cert-file docker/nginx/certs/soshal.crt -key-file docker/nginx/certs/soshal.key soshal.localhost 2>/dev/null
echo "Done"

has() {
  type "$1" > /dev/null 2>&1
}

if has wslpath; then
  echo "Install local CA to Windows"
  PWSH="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
  WIN_CAROOT="$(wslpath "$("$PWSH" -c mkcert -CAROOT)")"
  mkdir -p "$WIN_CAROOT"
  cp -f "$(mkcert -CAROOT)"/rootCA.pem "$WIN_CAROOT"/
  "$PWSH" -c mkcert -install 2>/dev/null
  echo "Done"
fi

echo "Fix misskey file permissions (See: https://github.com/misskey-dev/misskey/pull/9560)"
sudo chown -hR 991.991 ./docker/misskey/files
echo "Done"
