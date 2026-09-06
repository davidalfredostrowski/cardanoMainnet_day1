import fs from "fs";

import {
  validatorToAddress
} from "@lucid-evolution/lucid";


const blueprint =
  JSON.parse(
    fs.readFileSync(
      "./plutus.json",
      "utf8"
    )
  );


if (!blueprint.validators?.length) {
  throw new Error(
    "No validators found in plutus.json"
  );
}


const validatorBlueprint =
  blueprint.validators[0];


export const validator = {
  type: "PlutusV3",
  script: validatorBlueprint.compiledCode
};


export function getScriptAddress() {

//  return validatorToAddress(
//    "Preprod",
//    validator
//  );


return validatorToAddress(
  "Mainnet",
  validator
);


}
