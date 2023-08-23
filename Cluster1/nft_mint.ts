import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { readFile } from "fs/promises";

// https://arweave.net/1CFTBvWg_qf_Ket6basxOtR3LWtPy6AyJfa1dUVq4is

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

let imgUrl = "https://arweave.net/1CFTBvWg_qf_Ket6basxOtR3LWtPy6AyJfa1dUVq4is";

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  );

(async () => {
  try {
    const { nft } = await metaplex.nfts().create({
      name: "RUGGY",
      symbol: "RUG",
      sellerFeeBasisPoints: 999,
      uri: "https://arweave.net/1CFTBvWg_qf_Ket6basxOtR3LWtPy6AyJfa1dUVq4is",
      creators: [
        {
          address: keypair.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
    });
    console.log(`nft address: ${nft.address.toBase58()}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
