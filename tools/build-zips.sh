#!/usr/bin/env bash
# บีบอัดโปรเจกต์ตั้งต้นทุกตัวใน labs/ ไปไว้ที่ docs/files/
# รันก่อน commit ทุกครั้งที่แก้ไฟล์ใน labs/
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/files
for d in labs/*/; do
  name=$(basename "$d")
  rm -f "docs/files/$name.zip"
  (cd labs && zip -qr "../docs/files/$name.zip" "$name" \
      -x "*/node_modules/*" "*/.expo/*" "*/screenshot.png")
  echo "สร้าง docs/files/$name.zip"
done
