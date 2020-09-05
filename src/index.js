const BITBOXSDK = require('bitbox-sdk');
const { stringify } = require('@bitauth/libauth');

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

let token_ticker = "bbay";
let token_name = "bitcoinbay";
let token_document_url = "blockhack.ca";
let token_document_hash = null;
let decimals = '0x00';
let mint_baton_vout = '0x02';
let initial_token_mint_quantity = '0x000000000000000a';

let dust = 546;
let minerFee = 2000;

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
  const balance = await contract.getBalance();
  console.log('contract balance:', balance);
  const changeAmount = balance - dust - minerFee;
  console.log(changeAmount);

  console.log("OP Count", contract.opcount);
  console.log("Bytesize", contract.bytesize);


  const tx = await contract.functions
      .reclaim(alicePk, new SignatureTemplate(keypair))
      .to(aliceAddr, balance - 600)
      .meep()
/*    .genesisSLP(
      alicePk,
      new SignatureTemplate(keypair),
      token_ticker,
      token_name,
      token_document_url,
      decimals,
      mint_baton_vout,
      initial_token_mint_quantity
    )
    .withOpReturn([
      '0x534c5000',
      '0x01',
      'GENESIS',
      token_ticker,
      token_name,
      token_document_url,
      decimals,
      mint_baton_vout,
      initial_token_mint_quantity
    ])
    .to(contract.address, dust)
    .to(contract.address, changeAmount)
//    .withHardcodedFee(2000)
    .meep();
*/
  console.log('transaction details:', stringify(tx));
})();
