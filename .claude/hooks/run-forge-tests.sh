#!/bin/bash
# Async post-tool hook: Run forge tests in background after Solidity changes
# Reports results back to Claude when complete

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for Solidity files
if [[ "$FILE_PATH" != *.sol ]]; then
  exit 0
fi

PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd')
CONTRACTS_DIR="$PROJECT_DIR/contracts"

if [ ! -d "$CONTRACTS_DIR" ]; then
  exit 0
fi

export PATH="$HOME/.foundry/bin:$PATH"

# Run tests
TEST_OUTPUT=$(cd "$CONTRACTS_DIR" && forge test 2>&1)
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  # Extract just the failing test info
  FAILURES=$(echo "$TEST_OUTPUT" | grep -A 3 "FAIL\|Error\|Failing" | head -30)
  echo "{\"systemMessage\": \"Forge tests FAILED after editing $FILE_PATH:\\n$FAILURES\"}"
else
  PASS_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\d+ passed' || echo "tests passed")
  echo "{\"systemMessage\": \"Forge tests passed ($PASS_COUNT) after editing $FILE_PATH\"}"
fi
