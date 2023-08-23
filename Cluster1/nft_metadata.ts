import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";

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
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "RUGGY",
      symbol: "RUG",
      description: "THE BIGGEST RUG!",
      seller_fee_basis_points: 999,
      image: imgUrl,
      attributes: [
        {
          trait_type: "Feature",
          value: "USELESS",
        },
        {
          trait_type: "Softness",
          value: "TERRIBLE",
        },
        {
          trait_type: "Style",
          value: "PIXEL",
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://arweave.net/1CFTBvWg_qf_Ket6basxOtR3LWtPy6AyJfa1dUVq4is",
          },
        ],
        creators: [
          {
            address: keypair.publicKey.toBase58(),
            share: 100,
          },
        ],
      },
    });
    console.log(`uri: ${uri}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
