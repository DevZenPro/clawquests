import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const apiKeyName = process.env.CDP_API_KEY_ID;
  const privateKey = process.env.CDP_API_KEY_SECRET;
  
  if (!apiKeyName || !privateKey) {
    throw new Error("Missing CDP_API_KEY_ID or CDP_API_KEY_SECRET in .env");
  }
  
  console.log("Using API Key:", apiKeyName.slice(0, 10) + "...");
  
  // Configure Coinbase SDK
  Coinbase.configure({
    apiKeyName,
    privateKey,
  });

  console.log("Creating drip wallet on Base Sepolia...");
  
  // Create wallet
  const wallet = await Wallet.create({ networkId: "base-sepolia" });
  
  // Export wallet data (includes seed)
  const walletData = wallet.export();
  
  console.log("\n✅ Drip Wallet Created!");
  console.log("Wallet ID:", walletData.walletId);
  console.log("Address:", (await wallet.getDefaultAddress()).getId());
  console.log("Network:", walletData.networkId);
  
  // Fund with ETH
  console.log("\n💧 Requesting ETH from faucet...");
  const ethFaucet = await wallet.faucet();
  console.log("ETH faucet tx:", ethFaucet.getTransactionHash());
  
  // Fund with USDC
  console.log("\n💵 Requesting USDC from faucet...");
  const usdcFaucet = await wallet.faucet("usdc");
  console.log("USDC faucet tx:", usdcFaucet.getTransactionHash());
  
  // Save wallet data securely
  const envContent = `
# Drip Wallet (created ${new Date().toISOString()})
DRIP_WALLET_ID=${walletData.walletId}
DRIP_WALLET_SEED=${walletData.seed}
`;
  
  fs.appendFileSync(".env", envContent);
  console.log("\n✅ Wallet credentials saved to .env");
  
  // Get balances
  const balances = await wallet.listBalances();
  console.log("\n💰 Balances:");
  for (const [asset, balance] of Object.entries(balances)) {
    console.log(`  ${asset}: ${balance}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  if (err.response) {
    console.error("Response:", err.response.data);
  }
  console.error(err);
});
