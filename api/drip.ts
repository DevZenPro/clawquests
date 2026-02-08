import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { ethers } from "ethers";
import { HDKey } from "@scure/bip32";

// Rate limiting: track claims in memory (resets on cold start)
// For production, use Redis or a database
const claims: Map<string, number> = new Map();
const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Drip amounts (conservative to last longer)
const ETH_DRIP_AMOUNT = 0.001; // Enough for ~10 transactions
const USDC_DRIP_AMOUNT = 1;    // Enough to stake (min 0.2 USDC) + buffer

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address } = req.body;

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Missing or invalid address" });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }

    // Check rate limit
    const lastClaim = claims.get(address.toLowerCase());
    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN_MS) {
      const remainingMs = CLAIM_COOLDOWN_MS - (Date.now() - lastClaim);
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return res.status(429).json({
        error: `Rate limited. Try again in ${remainingHours} hours.`,
        nextClaimAt: new Date(lastClaim + CLAIM_COOLDOWN_MS).toISOString(),
      });
    }

    // Configure Coinbase SDK
    console.log("Configuring Coinbase SDK...");
    Coinbase.configure({
      apiKeyName: process.env.CDP_API_KEY_ID!,
      privateKey: process.env.CDP_API_KEY_SECRET!,
    });

    // Load drip wallet
    console.log("Loading drip wallet...");
    const dripWallet = await Wallet.import({
      walletId: process.env.DRIP_WALLET_ID!,
      seed: process.env.DRIP_WALLET_SEED!,
    });
    console.log("Wallet loaded:", dripWallet.getId());

    // Check drip wallet balances and refill if needed
    const balances = await dripWallet.listBalances();
    const ethBalance = balances.get("eth") || 0;
    const usdcBalance = balances.get("usdc") || 0;

    // Refill if low
    if (Number(ethBalance) < ETH_DRIP_AMOUNT * 2) {
      console.log("Refilling ETH from faucet...");
      await dripWallet.faucet();
    }
    if (Number(usdcBalance) < USDC_DRIP_AMOUNT * 2) {
      console.log("Refilling USDC from faucet...");
      await dripWallet.faucet("usdc");
    }

    // --- All transfers will use ethers.js for nonce management ---
    console.log("Deriving private key for ethers.js...");
    const seed = process.env.DRIP_WALLET_SEED!;
    const seedBuffer = Buffer.from(seed, 'hex');
    const master = HDKey.fromMasterSeed(seedBuffer);
    const derived = master.derive("m/44'/60'/0'/0/0");
    const privateKey = Buffer.from(derived.privateKey!).toString('hex');

    const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org');
    const signer = new ethers.Wallet('0x' + privateKey, provider);

    // Get the nonce manually to prevent race conditions
    const nonce = await signer.getNonce('pending');
    console.log(`Using starting nonce: ${nonce}`);

    // 1. Send ETH
    console.log(`Sending ${ETH_DRIP_AMOUNT} ETH to ${address} with nonce ${nonce}...`);
    const ethTx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther(ETH_DRIP_AMOUNT.toString()),
      nonce: nonce,
    });
    const ethTxHash = ethTx.hash;
    console.log("ETH transfer submitted via ethers.js:", ethTxHash);
    
    // 2. Send USDC
    const usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    const usdcAbi = ["function transfer(address to, uint256 amount) returns (bool)"];
    const usdcContract = new ethers.Contract(usdcContractAddress, usdcAbi, signer);
    
    console.log(`Sending ${USDC_DRIP_AMOUNT} USDC to ${address} with nonce ${nonce + 1}...`);
    const usdcAmountWei = ethers.parseUnits(USDC_DRIP_AMOUNT.toString(), 6);
    const usdcTx = await usdcContract.transfer(address, usdcAmountWei, { nonce: nonce + 1 });
    const usdcTxHash = usdcTx.hash;
    console.log("USDC transfer submitted via ethers.js:", usdcTxHash);

    // Record claim
    claims.set(address.toLowerCase(), Date.now());

    return res.status(200).json({
      success: true,
      address,
      eth: {
        amount: ETH_DRIP_AMOUNT,
        txHash: ethTxHash,
      },
      usdc: {
        amount: USDC_DRIP_AMOUNT,
        txHash: usdcTxHash,
      },
      message: `Sent ${ETH_DRIP_AMOUNT} ETH and ${USDC_DRIP_AMOUNT} USDC to ${address}`,
    });
  } catch (error: any) {
    console.error("Drip error:", error);
    const { address } = req.body; // Ensure address is available for the error message

    const errorMessage = error.message || String(error);
    const isInsufficientFunds = /insufficient funds/i.test(errorMessage);

    if (isInsufficientFunds) {
      const operatorMessage = `
URGENT: The automated ClawQuests testnet faucet is temporarily empty.

To use ClawQuests, your agent needs testnet funds.

What to do:
1. Please obtain testnet ETH and/or USDC for your agent's wallet yourself.
2. Your agent's wallet address is: ${address}

Recommended Faucets:
- ETH: https://www.alchemy.com/faucets/base-sepolia
- USDC: https://faucet.circle.com/

Once your agent is funded, it can begin completing quests.
      `;

      return res.status(503).json({
        error: "Faucet empty. Operator action required.",
        details: "The ClawQuests central drip wallet has insufficient funds. Please fund your agent manually.",
        operatorInstructions: operatorMessage.trim().replace(/^ +/gm, ''),
      });
    }

    return res.status(500).json({
      error: "Failed to process drip request",
      details: errorMessage,
      stack: error.stack?.split('\\n').slice(0, 3),
    });
  }
}
