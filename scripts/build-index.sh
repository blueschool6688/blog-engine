#!/bin/bash
# File: scripts/build-index.sh
# Aggregates Go and TS parser outputs using build-index.ts

echo "▶  Starting codebase indexing process..."
npx ts-node -T scripts/build-index.ts
echo "Done!"
