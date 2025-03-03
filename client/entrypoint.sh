#!/bin/sh
if [ -d ".next" ]; then
  rm -rf .next
fi
npm run build
exec npm run start