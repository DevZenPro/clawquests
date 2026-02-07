#!/bin/bash
# Post-tool hook: Run forge build after Solidity file changes
# Catches compilation errors immediately after edits

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for Solidity files in the contracts directory
if [[ "$FILE_PATH" != *.sol ]]; then
  exit 0
fi

PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd')
CONTRACTS_DIR="$PROJECT_DIR/contracts"

# Only proceed if contracts directory exists
if [ ! -d "$CONTRACTS_DIR" ]; then
  exit 0
fi

export PATH="$HOME/.foundry/bin:$PATH"

# Run forge build to check compilation
BUILD_OUTPUT=$(cd "$CONTRACTS_DIR" && forge build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "{\"decision\": \"block\", \"reason\": \"Forge build failed after editing $FILE_PATH:\\n$BUILD_OUTPUT\"}"
  exit 0
fi

# Build passed — no output needed
exit 0
