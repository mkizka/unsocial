#!/usr/bin/bash
set -eu

function has() {
  type "$1" > /dev/null 2>&1
}

if ! has mkcert; then
  echo "ERROR: You have to install mkcert (https://github.com/FiloSottile/mkcert#installation)"
  exit 1
fi

echo "Install local CA and copy to ./docker/mkcert"
mkcert -install 2> /dev/null
mkdir -p docker/mkcert 2> /dev/null
cp "$(mkcert -CAROOT)"/rootCA.pem ./docker/mkcert/
echo "Done"

CERTS_DIR="./docker/nginx/certs"
echo "Generte cert files to $CERTS_DIR"
mkdir -p $CERTS_DIR
mkcert -cert-file $CERTS_DIR/misskey.crt -key-file $CERTS_DIR/misskey.key misskey.localhost 2> /dev/null
mkcert -cert-file $CERTS_DIR/mastodon.crt -key-file $CERTS_DIR/mastodon.key mastodon.localhost 2> /dev/null
mkcert -cert-file $CERTS_DIR/unsocial.crt -key-file $CERTS_DIR/unsocial.key unsocial.localhost 2> /dev/null
mkcert -cert-file $CERTS_DIR/remote.crt -key-file $CERTS_DIR/remote.key remote.localhost 2> /dev/null
echo "Done"

if has wslpath; then
  echo "WSL Detected"
  function pwsh() {
    /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -c "$@"
  }
  if ! pwsh mkcert -help > /dev/null 2>&1; then
    echo "ERROR: You have to install mkcert on Windows (https://github.com/FiloSottile/mkcert#windows)"
    exit 1
  fi

  echo "Install local CA to Windows"
  WIN_CAROOT="$(wslpath "$(pwsh mkcert -CAROOT)")"
  mkdir -p "$WIN_CAROOT"
  cp -f "$(mkcert -CAROOT)"/rootCA.pem "$WIN_CAROOT"/
  pwsh mkcert -install 2> /dev/null
  echo "Done"
fi

echo "Fix misskey file permissions (See: https://github.com/misskey-dev/misskey/pull/9560)"
sudo chown -hR 991.991 ./docker/misskey/files
echo "Done"

echo "Fix mastodon file permissions (See: https://github.com/mastodon/mastodon/issues/3676)"
sudo chown -hR 991.991 ./docker/mastodon/public/system
echo "Done"
