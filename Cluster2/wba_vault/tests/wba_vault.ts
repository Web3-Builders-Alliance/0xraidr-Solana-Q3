import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WbaVault } from "../target/types/wba_vault";
import {
  PublicKey,
  Commitment,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN } from "bn.js";

describe("wba_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const owner = new Keypair();

  const program = anchor.workspace.WbaVault as Program<WbaVault>;
  const programId = new PublicKey(
    "Gr2zyUBmy5Em85K6qYB6pzCqg4pMp4PRENmyQ6n4tVJs"
  );
  const commitment: Commitment = "finalized"; // Processed, Confirmed, Finalized

  const state = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), owner.publicKey.toBytes()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), state.toBytes()],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), state.toBytes()],
    program.programId
  )[0];

  it("Airdrop tokens to new walet!", async () => {
    await anchor
      .getProvider()
      .connection.requestAirdrop(
        owner.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
      .then(confirmTx);
    console.log(owner.publicKey);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    await program.methods
      .initialize()
      .accounts({
        owner: owner.publicKey,
        auth,
        vault,
        state,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc()
      .then(confirmTx);
  });

  it("Deposit!", async () => {
    // Add your test here.
    const txHash = await program.methods
      .deposit(new BN(1.5 * LAMPORTS_PER_SOL))
      .accounts({
        owner: owner.publicKey,
        vault,
        state,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc()
      .then(confirmTx);
    console.log(`Success! Checkout your *DEPOSIT* here:
      https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  });

  it("Withdraw!", async () => {
    // Add your test here.
    const txHash = await program.methods
      .withdraw(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        owner: owner.publicKey,
        vault,
        state,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc()
      .then(confirmTx);
    console.log(`Success! Checkout your *WITHDRAW* here:
      https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  });
});

const confirmTx = async (signature: string) => {
  const latestBlockhash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    "confirmed"
  );
  return signature;
};
