#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found."
    exit 1
fi

if [ -z "$MANTLESCAN_API_KEY" ]; then
    echo "Error: MANTLESCAN_API_KEY not found in .env"
    echo "Please add it: MANTLESCAN_API_KEY=your_api_key"
    exit 1
fi

# New Deployment Addresses (Deployed on Mantle Sepolia - Chain ID 5003)
USDC_ADDR="0x53b8e9e6513A2e7A4d23F8F9BFe3F5985C9788e4"
GOLD_ADDR="0x6830999D9173B235dF6ac8c9068c4235fd58f532"
POOL_ADDR="0x475F5c184D23D5839123e7CDB23273eF0470C018"

# Pyth Config
PYTH_ADDR="0x98046Bd286715D3B0BC227Dd7a956b83D8978603"
# ID ETH/USD (Substitute for Gold as XAU feed is inactive)
GOLD_ID="0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"

# 1. Verify MockUSDC
echo "Verifying MockUSDC at $USDC_ADDR..."
forge verify-contract $USDC_ADDR src/MockTokens.sol:MockUSDC --chain-id 5003 --watch

# 2. Verify MockGold
echo "Verifying MockGold at $GOLD_ADDR..."
forge verify-contract $GOLD_ADDR src/MockTokens.sol:MockGold --chain-id 5003 --watch

# 3. Verify AureoRWAPool
echo "Verifying AureoRWAPool at $POOL_ADDR..."
# Constructor Args: pythAddress, goldId, goldToken, usdcToken
# Note: We use the NEW addresses for gold and usdc here
ARGS=$(cast abi-encode "constructor(address,bytes32,address,address)" \
    $PYTH_ADDR \
    $GOLD_ID \
    $GOLD_ADDR \
    $USDC_ADDR)

forge verify-contract $POOL_ADDR src/AureoRWAPool.sol:AureoRWAPool --constructor-args $ARGS --chain-id 5003 --watch

echo "Verification process completed."