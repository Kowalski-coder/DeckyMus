#!/bin/bash
set -e

echo "==> Building DeckyMus frontend..."
npx rollup -c

echo "==> Packaging DeckyMus..."
TMP_DIR="/tmp/deckymus_pkg"
rm -rf "$TMP_DIR" DeckyMus.zip
mkdir -p "$TMP_DIR/DeckyMus"

# Copy all required plugin files
cp -r main.py dist assets py_modules plugin.json package.json README.md "$TMP_DIR/DeckyMus/"

# Clean python cache
find "$TMP_DIR/DeckyMus" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$TMP_DIR/DeckyMus" -type f -name "*.pyc" -delete 2>/dev/null || true

# Create zip archive with root folder DeckyMus/
(cd "$TMP_DIR" && zip -r -q DeckyMus.zip DeckyMus)
mv "$TMP_DIR/DeckyMus.zip" ./DeckyMus.zip
rm -rf "$TMP_DIR"

echo "==> DeckyMus.zip created successfully!"
ls -lh DeckyMus.zip
