#!/usr/bin/env bash
set -eu
log=$(mktemp)
trap 'rm -f "$log"' EXIT
for delay in 0 15 45; do
  if (( delay )); then
    echo "Pages could not see the uploaded artifact. Retrying in ${delay}s."
    sleep "$delay"
  fi
  node "$1" 2>&1 | tee "$log"
  status=${PIPESTATUS[0]}
  if (( status == 0 )); then exit 0; fi
  if ! grep -Fq 'No artifacts named "github-pages" were found for this workflow run' "$log"; then
    exit "$status"
  fi
done
exit "$status"
