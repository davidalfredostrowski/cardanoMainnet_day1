import {
  MeshTxBuilder,
  mConStr0
} from "@meshsdk/core";

import {
  getWallet,
  provider
} from "./wallet.js";

import {
  scriptAddress
} from "./contract.js";


const message =
  process.argv[2] || "Hello World";


const wallet = await getWallet();

const walletAddress =
  await wallet.getChangeAddress();

const walletUtxos =
  await wallet.getUtxos();


if (walletUtxos.length === 0) {
  throw new Error(
    "Wallet has no UTXOs. Fund it with Preprod test ADA first."
  );
}


// Aiken ByteArray values are represented as hex.
const messageHex =
  Buffer
    .from(message, "utf8")
    .toString("hex");


// Datum {
//     message: ByteArray
// }
const datum =
  mConStr0([
    messageHex
  ]);


console.log(
  `Initializing state with: "${message}"`
);

console.log(
  "Script address:",
  scriptAddress
);


const txBuilder =
  new MeshTxBuilder({
    fetcher: provider,
    verbose: true
  });


const unsignedTx =
  await txBuilder

    .txOut(
      scriptAddress,
      [
        {
          unit: "lovelace",
          quantity: "3000000"
        }
      ]
    )

    .txOutInlineDatumValue(
      datum
    )

    .changeAddress(
      walletAddress
    )

    .selectUtxosFrom(
      walletUtxos
    )

    .complete();


const signedTx =
  await wallet.signTx(
    unsignedTx
  );


const txHash =
  await provider.submitTx(
    signedTx
  );


console.log("\nSubmitted:");
console.log(txHash);

console.log(
  "\nWait for confirmation before running get.js"
);
