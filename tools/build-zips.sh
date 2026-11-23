#!/usr/bin/env bash
# บีบอัดโปรเจกต์ตั้งต้นทุกตัวใน labs/ ไปไว้ที่ docs/files/
# รันก่อน commit ทุกครั้งที่แก้ไฟล์ใน labs/
#
# ถ้า zip ของแล็บตัวไหนถูกย้ายไปพักไว้ที่ drafts/files/ แล้ว (สัปดาห์ที่ยังไม่ปล่อย)
# สคริปต์จะเขียนทับที่ drafts/files/ ให้ ไม่ย้ายกลับเข้า docs/files/ เอง
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/files
for d in labs/*/; do
  name=$(basename "$d")
  out=docs/files
  [ -f "drafts/files/$name.zip" ] && out=drafts/files
  rm -f "$out/$name.zip"
  (cd labs && zip -qr "../$out/$name.zip" "$name" \
      -x "*/node_modules/*" "*/.expo/*" "*/screenshot.png")
  echo "สร้าง $out/$name.zip"
done
