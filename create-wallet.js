import {
  MeshWallet,
  KoiosProvider
} from "@meshsdk/core";

const provider = new KoiosProvider("preprod");

const mnemonic = MeshWallet.brew(false);

console.log(mnemonic);
