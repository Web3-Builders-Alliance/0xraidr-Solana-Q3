import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);

const vaultState = new PublicKey(
  "BhyMQ4ivmLbSr95Uvhezjj9jF5Nt9NKcMxfNLH8chvsh"
);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(
  vaultAuth_seeds,
  program.programId
)[0];

const mint = new PublicKey("Hhp8MxBZx3TSoC9DiYTyhJvnECjvs6VkZmsZ1zVoHrt9");

(async () => {
  const ownerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    mint,
    keypair.publicKey
  );

  const vaultAta = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    mint,
    vaultAuth,
    true
  );

  const txhash = await program.methods
    .withdrawSpl(new BN(1e6))
    .accounts({
      owner: keypair.publicKey,
      vaultState,
      ownerAta: ownerAta.address,
      vaultAta: vaultAta.address,
      vaultAuth,
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([keypair])
    .rpc();
  console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
})();
