import {
  Constr,
  Data
} from "@lucid-evolution/lucid";

import {
  getLucid
} from "./lucid.js";

import {
  getScriptAddress
} from "./contract.js";


const message =
  process.argv[2] || "Hello World";


const lucid =
  await getLucid();

const scriptAddress =
  getScriptAddress();


console.log(
  "Script address:"
);

console.log(
  scriptAddress
);


// --------------------------------------------------
// Check whether state already exists
// --------------------------------------------------

const existingUtxos =
  await lucid.utxosAt(
    scriptAddress
  );


if (existingUtxos.length > 0) {

  console.log(
    `\nState already exists at this script address.`
  );

  console.log(
    `Found ${existingUtxos.length} UTXO(s).`
  );

  console.log(
    "\nUse set.js to change the existing value instead of init.js."
  );

  process.exit(0);
}


// --------------------------------------------------
// Convert text → UTF-8 hex
// --------------------------------------------------

const messageHex =
  Buffer
    .from(
      message,
      "utf8"
    )
    .toString("hex");


// --------------------------------------------------
// Aiken datum:
//
// pub type Datum {
//   message: ByteArray,
// }
//
// becomes:
//
// Constr 0 [ ByteArray ]
// --------------------------------------------------

const datum =
  Data.to(
    new Constr(
      0,
      [
        messageHex
      ]
    )
  );


console.log(
  `\nInitializing storedData = "${message}"`
);


// --------------------------------------------------
// Create initial state UTXO
// --------------------------------------------------

const tx =
  await lucid
    .newTx()

    .pay.ToContract(
      scriptAddress,

      {
        kind: "inline",
        value: datum
      },

      {
        lovelace: 3000000n
      }
    )

    .complete();


// --------------------------------------------------
// Sign
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
  "\nInitialization transaction submitted:"
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
