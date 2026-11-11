#!/usr/bin/env bash
# Inject AppStream metainfo (and refresh icon/doc bits) into a Forge-built .deb.
# electron-installer-debian has no first-class metainfo option, so we rebuild.
set -euo pipefail

DEB="${1:?Usage: enrich-sharefolder-deb.sh <path-to.deb>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="${ROOT}/packages/sharefolder-app"
METAINFO="${APP_DIR}/assets/linux/io.sharefolder.app.metainfo.xml"
LICENSE="${APP_DIR}/LICENSE"

if [[ ! -f "${DEB}" ]]; then
  echo "Deb not found: ${DEB}" >&2
  exit 1
fi
if [[ ! -f "${METAINFO}" ]]; then
  echo "Missing metainfo: ${METAINFO}" >&2
  exit 1
fi

WORK="$(mktemp -d)"
cleanup() { rm -rf "${WORK}"; }
trap cleanup EXIT

echo "Enriching ${DEB}"
dpkg-deb -R "${DEB}" "${WORK}/root"

mkdir -p "${WORK}/root/usr/share/metainfo"
install -m 0644 "${METAINFO}" "${WORK}/root/usr/share/metainfo/io.sharefolder.app.metainfo.xml"

# Prefer our MIT license over the Electron LICENSE that installer copies.
if [[ -f "${LICENSE}" ]]; then
  mkdir -p "${WORK}/root/usr/share/doc/sharefolder"
  install -m 0644 "${LICENSE}" "${WORK}/root/usr/share/doc/sharefolder/copyright"
fi

# Ensure hicolor tree is present even if maker only wrote pixmaps.
if [[ ! -d "${WORK}/root/usr/share/icons/hicolor/512x512/apps" ]]; then
  mkdir -p "${WORK}/root/usr/share/icons/hicolor"
  cp -a "${APP_DIR}/assets/linux/icons/." "${WORK}/root/usr/share/icons/hicolor/"
  find "${WORK}/root/usr/share/icons/hicolor" -type d -exec chmod 0755 {} +
  find "${WORK}/root/usr/share/icons/hicolor" -type f -exec chmod 0644 {} +
fi

# Also keep a pixmap fallback for older menus.
if [[ ! -f "${WORK}/root/usr/share/pixmaps/sharefolder.png" ]]; then
  mkdir -p "${WORK}/root/usr/share/pixmaps"
  install -m 0644 \
    "${APP_DIR}/assets/linux/icons/512x512/apps/sharefolder.png" \
    "${WORK}/root/usr/share/pixmaps/sharefolder.png"
fi

# Validate AppStream when the tool is available (non-fatal).
if command -v appstreamcli >/dev/null 2>&1; then
  appstreamcli validate --no-net \
    "${WORK}/root/usr/share/metainfo/io.sharefolder.app.metainfo.xml" \
    || echo "Warning: appstreamcli validate reported issues" >&2
fi

OUT="${WORK}/sharefolder-enriched.deb"
fakeroot dpkg-deb --root-owner-group -b "${WORK}/root" "${OUT}"
mv -f "${OUT}" "${DEB}"
echo "Enriched $(basename "${DEB}")"
