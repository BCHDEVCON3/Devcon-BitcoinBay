const BITBOXSDK = require('bitbox-sdk');
const slpjs = require('slpjs');
const BigNumber = require('bignumber.js');
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
  console.log(alicePk);
  const alicePkh = BITBOX.Crypto.hash160(alicePk);
  console.log(alicePkh);
  const aliceAddr = BITBOX.HDNode.toCashAddress(account);
  console.log(aliceAddr);

  const artifact = CashCompiler.compileFile(path.join(__dirname, 'SLPGenesis.cash'));
  const provider = new ElectrumNetworkProvider(NETWORK);

  const contract = new Contract(artifact, [alicePkh], provider);
  console.log('contract address:', contract.address);
  console.log('contract balance:', await contract.getBalance());
})();
