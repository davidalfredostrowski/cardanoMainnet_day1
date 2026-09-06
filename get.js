import {
  Data
} from "@lucid-evolution/lucid";

import {
  getLucid
} from "./lucid.js";

import {
  getScriptAddress
} from "./contract.js";


const lucid = await getLucid();

const scriptAddress =
  getScriptAddress();


const utxos =
  await lucid.utxosAt(
    scriptAddress
  );


if (utxos.length === 0) {
  console.log(
    "No state UTXO found."
  );

  process.exit(0);
}


const stateUtxo =
  utxos[0];

if (!stateUtxo.datum) {
  throw new Error(
    "State UTXO has no inline datum."
  );
}


// Decode the Plutus datum
const datum =
  Data.from(
    stateUtxo.datum
  );


// Extract the ByteArray
const messageHex =
  datum.fields[0];


// Convert hex -> UTF-8
const message =
  Buffer
    .from(
      messageHex,
      "hex"
    )
    .toString("utf8");


console.log(
  "storedData =",
  message
);
