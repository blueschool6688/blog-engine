#!/bin/bash
# File: scripts/pre-commit-hook.sh
# Git pre-commit hook to auto-update the codebase index file.

echo "▶  [Git Hook] Running codebase index generation..."

# Chạy build-index để quét dự án và tạo index
npx ts-node -T scripts/build-index.ts

# Tự động add file index mới tạo/cập nhật vào commit hiện tại
if [ -f ".ai/codebase-index.md" ]; then
  git add .ai/codebase-index.md
  echo "✅  [Git Hook] Codebase index file added to commit."
else
  echo "❌  [Git Hook] Failed to locate codebase index file."
  exit 1
fi
