const BITBOXSDK = require('bitbox-sdk');
const slpjs = require('slpjs');
const {
  Contract,
  SignatureTemplate,
  CashCompiler,
  ElectrumNetworkProvider
} = require('cashscript');
const path = require('path');


const BITBOX = new BITBOXSDK.BITBOX({ restURL: 'https://rest.bitcoin.com/v2/' });
const NETWORK = "testnet";

const bitboxNetwork = new slpjs.BitboxNetwork(BITBOX);

(async function() {
  const mnemonic = "talk story visual hidden behind wasp evil abandon bus brand circle sketch";
  const rootSeed = await BITBOX.Mnemonic.toSeed(mnemonic);
  const hdNode = BITBOX.HDNode.fromSeed(rootSeed, NETWORK);
  const account = BITBOX.HDNode.derivePath(hdNode, "m/44'/1'/0'/0/0");
  const keypair = BITBOX.HDNode.toKeyPair(account);

  // Derive alice's public key and public key hash
  const alicePk = BITBOX.ECPair.toPublicKey(keypair);
  const alicePkh = BITBOX.Crypto.hash160(alicePk);

  const aliceAddr = BITBOX.HDNode.toCashAddress(account);
  console.log(alicePk);
  console.log(alicePkh);
  console.log(aliceAddr);
})();
