#!/usr/bin/env bash
# Collect Electron Forge make outputs into stable public download names.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAKE_DIR="${ROOT}/packages/sharefolder-app/out/make"
OUT_DIR="${1:-${ROOT}/release-assets}"
PLATFORM="${2:-$(uname -s | tr '[:upper:]' '[:lower:]')}"

mkdir -p "${OUT_DIR}"

copy_one() {
  local pattern="$1"
  local dest="$2"
  local match
  match="$(find "${MAKE_DIR}" -type f -path "${pattern}" | head -n 1 || true)"
  if [[ -z "${match}" ]]; then
    echo "Missing artifact for ${dest} (pattern: ${pattern})" >&2
    return 1
  fi
  cp "${match}" "${OUT_DIR}/${dest}"
  echo "Collected ${dest} <- ${match}"
}

case "${PLATFORM}" in
  linux|Linux)
    copy_one '*/deb/x64/*.deb' 'ShareFolder-linux-amd64.deb'
    copy_one '*/zip/linux/x64/*.zip' 'ShareFolder-linux-x64.zip'
    ;;
  darwin|mac|macos|Darwin)
    if find "${MAKE_DIR}" -type f -path '*/zip/darwin/arm64/*.zip' | grep -q .; then
      copy_one '*/zip/darwin/arm64/*.zip' 'ShareFolder-mac-arm64.zip'
    fi
    if find "${MAKE_DIR}" -type f -path '*/zip/darwin/x64/*.zip' | grep -q .; then
      copy_one '*/zip/darwin/x64/*.zip' 'ShareFolder-mac-x64.zip'
    fi
    ;;
  windows|win32|mingw*|msys*|cygwin*|Windows_NT)
    copy_one '*/squirrel.windows/x64/*Setup.exe' 'ShareFolder-windows-x64-setup.exe'
    copy_one '*/zip/win32/x64/*.zip' 'ShareFolder-windows-x64.zip'
    ;;
  *)
    echo "Unknown platform: ${PLATFORM}" >&2
    exit 1
    ;;
esac

ls -lah "${OUT_DIR}"
