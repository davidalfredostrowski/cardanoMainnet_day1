import fs from "fs";
import {
  MeshWallet,
  KoiosProvider
} from "@meshsdk/core";

const WALLET_FILE = "./wallet.mnemonic";

// Cardano Preprod
export const provider = new KoiosProvider("preprod");

function loadOrCreateMnemonic() {

  if (fs.existsSync(WALLET_FILE)) {
    const text = fs.readFileSync(WALLET_FILE, "utf8").trim();
    return text.split(/\s+/);
  }

  const words = MeshWallet.brew(false);

  fs.writeFileSync(
    WALLET_FILE,
    words.join(" "),
    { mode: 0o600 }
  );

  console.log("Created new TESTNET wallet.");
  console.log(`Mnemonic stored in ${WALLET_FILE}`);

  return words;
}

export async function getWallet() {

  const mnemonic = loadOrCreateMnemonic();

  const wallet = new MeshWallet({
    networkId: 0,

    fetcher: provider,
    submitter: provider,

    key: {
      type: "mnemonic",
      words: mnemonic
    }
  });

  await wallet.init();

  return wallet;
}


// If wallet.js itself was executed:
if (
  import.meta.url ===
  `file://${process.argv[1]}`
) {

  const wallet = await getWallet();

  const address =
    await wallet.getChangeAddress();

  console.log("\nPreprod wallet address:");
  console.log(address);

  const balance =
    await wallet.getBalance();

  console.log("\nBalance:");
  console.log(balance);
}
