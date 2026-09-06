import {
  getLucid
} from "./lucid.js";


const lucid =
  await getLucid();

const address =
  await lucid.wallet().address();

const utxos =
  await lucid.wallet().getUtxos();


let lovelace = 0n;

for (const utxo of utxos) {
  lovelace +=
    utxo.assets.lovelace ?? 0n;
}


const ada =
  Number(lovelace) / 1_000_000;


console.log(
  "Network: Mainnet"
);

console.log(
  "Wallet address:"
);

console.log(
  address
);

console.log(
  "\nUTXO count:",
  utxos.length
);

console.log(
  "\nBalance:",
  ada,
  "ADA"
);
