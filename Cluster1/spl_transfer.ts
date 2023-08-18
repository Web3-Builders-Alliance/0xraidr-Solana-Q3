import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import {
  createCreateMetadataAccountV2Instruction,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as spl from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("Hhp8MxBZx3TSoC9DiYTyhJvnECjvs6VkZmsZ1zVoHrt9");

// Recipient address
const to = new PublicKey("4pFmm4QDeuoSxbG76v5pUZaxiSeZZijipx4o7YyTrcwH");

// const token_decimals = 1_000_000n;
const amount = 14 * 1000000;

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    let fromWalletAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    // Get the token account of the toWallet address, and if it does not exist, create it
    let toWalletAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    // Transfer the new token to the "toTokenAccount" we just created
    let tx = await transfer(
      connection,
      keypair,
      fromWalletAta.address,
      toWalletAta.address,
      keypair,
      amount
    );
    console.log(fromWalletAta.address.toBase58());
    console.log(`Success! Check out your TX here: 
    https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
