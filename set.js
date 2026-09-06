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
// Connect using lucid.js
// lucid.js should now be configured for Mainnet.
// --------------------------------------------------

const lucid = await getLucid();

const scriptAddress =
  getScriptAddress();


console.log("Script address:");
console.log(scriptAddress);


// Safety check: Mainnet addresses should not be addr_test...
if (scriptAddress.startsWith("addr_test")) {
  throw new Error(
    "STOP: script address is still a testnet address. Check contract.js."
  );
}


// --------------------------------------------------
// Find UTXOs at the validator address
// --------------------------------------------------

const allUtxos =
  await lucid.utxosAt(
    scriptAddress
  );


console.log(
  `\nFound ${allUtxos.length} total UTXO(s) at script address.`
);


// --------------------------------------------------
// Only UTXOs with inline datums represent our
// Day 1 application state.
//
// This avoids the problem we encountered on Preprod
// where ADA was sent directly to the script address
// without a datum.
// --------------------------------------------------

const stateUtxos =
  allUtxos.filter(
    utxo => utxo.datum !== undefined
  );


if (stateUtxos.length === 0) {
  throw new Error(
    "No state UTXO with an inline datum found. Run init.js first."
  );
}


if (stateUtxos.length > 1) {
  throw new Error(
    `Found ${stateUtxos.length} possible state UTXOs. ` +
    "Refusing to guess which one is the application state."
  );
}


// --------------------------------------------------
// We require exactly one state UTXO.
// --------------------------------------------------

const oldState =
  stateUtxos[0];


console.log("\nCurrent state UTXO:");

console.log(
  `${oldState.txHash}#${oldState.outputIndex}`
);

console.log(
  "Assets:",
  oldState.assets
);


// --------------------------------------------------
// Decode current datum for display
// --------------------------------------------------

try {

  const oldDatum =
    Data.from(
      oldState.datum
    );

  const oldMessageHex =
    oldDatum.fields[0];

  const oldMessage =
    Buffer
      .from(
        oldMessageHex,
        "hex"
      )
      .toString("utf8");

  console.log(
    `Current storedData: "${oldMessage}"`
  );

} catch (error) {

  throw new Error(
    "The state UTXO datum does not match the expected Day 1 datum format."
  );

}


// --------------------------------------------------
// Convert new message into Aiken ByteArray.
//
// Example:
//
// "hello"
//
// becomes:
//
// 68656c6c6f
// --------------------------------------------------

const newMessageHex =
  Buffer
    .from(
      newMessage,
      "utf8"
    )
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
// Encoding:
//
// Constr 0 [
//   ByteArray
// ]
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
// New datum
//
// Aiken:
//
// pub type Datum {
//   message: ByteArray,
// }
//
// Encoding:
//
// Constr 0 [
//   ByteArray
// ]
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
// Build state-transition transaction
//
// OLD:
//
//   script UTXO
//   datum = old message
//
//             ↓ spend
//
//   Aiken validator checks:
//     new datum == redeemer.new_message
//
//             ↓
//
// NEW:
//
//   script UTXO
//   datum = new message
//
// We preserve the assets held by the old state UTXO.
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
// Sign with the wallet selected in lucid.js
// --------------------------------------------------

const signedTx =
  await tx
    .sign
    .withWallet()
    .complete();


// --------------------------------------------------
// Submit
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
  "\nAfter confirmation run:"
);

console.log(
  "node get.js"
);
