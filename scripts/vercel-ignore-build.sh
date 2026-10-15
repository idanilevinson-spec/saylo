#!/bin/bash
# Vercel "Ignored Build Step": exit 1 = build, exit 0 = skip.
# Every deployment Vercel keeps counts toward the free plan's 10 GB
# deployment storage, so only production (main) builds by default.
# To get a preview URL for a branch, put [preview] in the commit message.

if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production build - building."
  exit 1
fi

if printf '%s' "$VERCEL_GIT_COMMIT_MESSAGE" | grep -qF '[preview]'; then
  echo "Commit asked for a preview - building."
  exit 1
fi

echo "Preview skipped to save deployment storage (add [preview] to the commit message to build one)."
exit 0
