#!/bin/bash
# Post-tool hook: Run TypeScript type check after TS/TSX file changes
# Catches type errors immediately after edits

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for TypeScript files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd')

# Only proceed if package.json exists
if [ ! -f "$PROJECT_DIR/package.json" ]; then
  exit 0
fi

export PATH="$HOME/.local/share/nvm/versions/node/v22.16.0/bin:$PATH"

# Run tsc --noEmit for type checking
TSC_OUTPUT=$(cd "$PROJECT_DIR" && npx tsc --noEmit 2>&1)
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
  # Only report errors related to the changed file to reduce noise
  RELEVANT=$(echo "$TSC_OUTPUT" | grep -A 2 "$(basename "$FILE_PATH")" || echo "$TSC_OUTPUT" | head -20)
  echo "{\"decision\": \"block\", \"reason\": \"TypeScript errors after editing $FILE_PATH:\\n$RELEVANT\"}"
  exit 0
fi

exit 0
