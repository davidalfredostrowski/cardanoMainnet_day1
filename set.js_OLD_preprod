import {
  Constr,
  Data
} from "@lucid-evolution/lucid";

import {
  getLucid
} from "./lucid.js";

import {
  validator,
  getScriptAddress
} from "./contract.js";


const newMessage = process.argv[2];

if (!newMessage) {
  console.log('Usage: node set.js "new message"');
  process.exit(1);
}


// --------------------------------------------------
// Connect to Cardano Preprod through Koios
// --------------------------------------------------

const lucid = await getLucid();

const scriptAddress = getScriptAddress();

console.log("Script address:");
console.log(scriptAddress);


// --------------------------------------------------
// Find the current state UTXO
// --------------------------------------------------

const stateUtxos = await lucid.utxosAt(
  scriptAddress
);

if (stateUtxos.length === 0) {
  throw new Error(
    "No state UTXO found at the script address."
  );
}

if (stateUtxos.length > 1) {
  console.log(
    `Warning: found ${stateUtxos.length} UTXOs. Using the first one.`
  );
}

const oldState = stateUtxos[0];

console.log("\nCurrent state UTXO:");
console.log(
  `${oldState.txHash}#${oldState.outputIndex}`
);


// --------------------------------------------------
// Convert the new JavaScript string into the
// ByteArray representation expected by Aiken
// --------------------------------------------------

const newMessageHex =
  Buffer
    .from(newMessage, "utf8")
    .toString("hex");

console.log(
  `\nChanging storedData to: "${newMessage}"`
);


// --------------------------------------------------
// Redeemer
//
// Aiken:
//
// pub type Redeemer {
//   new_message: ByteArray,
// }
//
// This becomes:
//
// Constr 0 [ ByteArray ]
// --------------------------------------------------

const redeemer =
  Data.to(
    new Constr(
      0,
      [
        newMessageHex
      ]
    )
  );


// --------------------------------------------------
// New Datum
//
// Aiken:
//
// pub type Datum {
//   message: ByteArray,
// }
//
// Same Plutus-data structure:
// Constr 0 [ ByteArray ]
// --------------------------------------------------

const newDatum =
  Data.to(
    new Constr(
      0,
      [
        newMessageHex
      ]
    )
  );


// --------------------------------------------------
// Build the Cardano state-transition transaction
//
// 1. Consume old script UTXO
// 2. Supply redeemer
// 3. Recreate output at same script address
// 4. Store new inline datum
// 5. Attach Aiken Plutus V3 validator
// --------------------------------------------------

const tx =
  await lucid
    .newTx()

    .collectFrom(
      [oldState],
      redeemer
    )

    .pay.ToContract(
      scriptAddress,
      {
        kind: "inline",
        value: newDatum
      },
      oldState.assets
    )

    .attach.SpendingValidator(
      validator
    )

    .complete();


// --------------------------------------------------
// Sign using wallet.mnemonic
// --------------------------------------------------

const signedTx =
  await tx
    .sign
    .withWallet()
    .complete();


// --------------------------------------------------
// Submit through Koios
// --------------------------------------------------

const txHash =
  await signedTx.submit();


console.log(
  "\nSET transaction submitted successfully:"
);

console.log(
  txHash
);

console.log(
  '\nAfter confirmation, run: node get.js'
);
