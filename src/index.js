const slplist = require("slp-list");
slplist.Config.SetUrl("https://slpdb-testnet.fountainhead.cash");

const BITBOXSDK = require('bitbox-sdk');
const { stringify } = require('@bitauth/libauth');
const BCHJS = require("@chris.troutner/bch-js")
const slpjs = require('slpjs');
const {
  Contract,
  SignatureTemplate,
  CashCompiler,
  ElectrumNetworkProvider
} = require('cashscript');
const path = require('path');

let bchjs = new BCHJS({ restURL: 'https://tapi.fullstack.cash/v3/' })

const BITBOX = new BITBOXSDK.BITBOX({ restURL: 'https://trest.bitcoin.com/v2/' });
const NETWORK = "testnet";

const bitboxNetwork = new slpjs.BitboxNetwork(BITBOX);

let token_ticker = "BCH";
let token_name = "BCHDevCon";
let token_document_url = "devcon.cash";
let token_document_hash = "0xe594826a45abd156001bd6fd274ba4a79ad584d04fe3b299c5a8ea4441cf9570";
//let token_document_hash = '';
let decimals = '0x00';
let mint_baton_vout = '0x02';
let initial_token_mint_quantity = '0x000000000000000a';
let additional_token_mint_quantity = '0x00000000000000a0';


let dust = 546;
let minerFee = 2000;

let no_0x_slp_tx_id = "ab3af4036ce3349b9a0bb31e4b9ea7b1f7bde4137210dde3c2e3983221a1c03e";
let slp_tx_id = "0x" + no_0x_slp_tx_id;

let no_0x_frp_upload_txid = "4ae4d30c4552d3247273e871d96bc4cd7b64f926eff2277d1a9ac4ea7250e08d";
let frp_upload_txid = "0x" + no_0x_frp_upload_txid;

(async function() {
  const mnemonic = "talk story visual hidden behind wasp evil abandon bus brand circle sketch";
  const rootSeed = await BITBOX.Mnemonic.toSeed(mnemonic);
  const hdNode = BITBOX.HDNode.fromSeed(rootSeed, NETWORK);
  const account = BITBOX.HDNode.derivePath(hdNode, "m/44'/1'/0'/0/0");
  const keypair = BITBOX.HDNode.toKeyPair(account);

  // Derive alice's public key and public key hash
  const alicePk = BITBOX.ECPair.toPublicKey(keypair);
  console.log("Alice PubKey Buffer:", alicePk);
  const alicePkh = BITBOX.Crypto.hash160(alicePk);
  console.log("Alice PubKeyHash Buffer:", alicePkh);
  const aliceAddr = BITBOX.HDNode.toCashAddress(account);
  console.log("Alice Address:", aliceAddr);

  const artifact = CashCompiler.compileFile(path.join(__dirname, 'SLPGenesis.cash'));
  const provider = new ElectrumNetworkProvider(NETWORK);

  const contract = new Contract(artifact, [alicePkh], provider);
  console.log('contract address:', contract.address);
  const contractToSLPAddr = bchjs.SLP.Address.toSLPAddress(contract.address);
  console.log('contract SLP address:', contractToSLPAddr);
  const balance = await contract.getBalance();
  console.log('contract balance:', balance);
  const changeAmount = balance - (dust * 2) - minerFee;

  console.log("OP Count", contract.opcount);
  console.log("Bytesize", contract.bytesize);
  const contractUTXOs = await contract.getUtxos();
//  console.log("getUtxos", contractUTXOs);

  const mappedMintVout = contractUTXOs.find((obj) => {
    if (obj.txid === no_0x_slp_tx_id && obj.vout === 2) {
      return {
        txid: obj.txid,
        vout: parseInt(obj.vout),
        satoshis: parseInt(obj.satoshis)
      };
    }
  });

  const mappedUploadVout = contractUTXOs.find((obj) => {
    if (obj.txid === no_0x_frp_upload_txid && obj.vout === 1) {
      return {
        txid: obj.txid,
        vout: parseInt(obj.vout),
        satoshis: parseInt(obj.satoshis)
      };
    }
  });

  const mappedFundingVout = contractUTXOs.find((obj) => {
    if (obj.satoshis >= 2000) {
      return {
        txid: obj.txid,
        vout: parseInt(obj.vout),
        satoshis: parseInt(obj.satoshis)
      };
    }
  });

  console.log("Mint VOut:", mappedMintVout);
  console.log("Fund VOut:", mappedFundingVout);

  const remainder = balance - dust - dust - minerFee;

  const tx = await contract.functions
    .reclaim(alicePk, new SignatureTemplate(keypair))
//    .to("bchtest:qzt6sz836wdwscld0pgq2prcpck2pssmwge9q87pe9", balance - 4500)
//    .send()
/*
//  The "require(tx.hashOutputs..." statement fails to equate
//  Temporarily disabling "genesisSLP" function
    .genesisSLP(
      alicePk,
      new SignatureTemplate(keypair),
      token_ticker,
      token_name,
      token_document_url,
      token_document_hash,
      decimals,
      mint_baton_vout,
      initial_token_mint_quantity
    )
*/
// GENESIS
/*
    .withOpReturn([
      '0x534c5000',
      '0x01',
      'GENESIS',
      token_ticker,
      token_name,
      token_document_url,
      token_document_hash,
      decimals,
      mint_baton_vout,
      initial_token_mint_quantity
    ])
*/
// MINT
/*
    .withOpReturn([
      '0x534c5000',
      '0x01',
      'MINT',
      slp_tx_id,
      mint_baton_vout,
      additional_token_mint_quantity
    ])
*/
// FRP Upload
/*
    .withOpReturn([
      '0x46525000',             // 'FRP\x00'
      'UPLOAD',
      'json',
      'SLPGenesis',
      'QmQG7aofWi4jvTFDng3xG8G1t6yCtMcBZP58LMDnyYYpA1',
      '0x01'
    ])
*/
// FRP Update
/*
    .withOpReturn([
      '0x46525000',             // 'FRP\x00'
      'UPDATE',
      frp_upload_txid,          // Upload tx id
      'cash',
      'SLPGenesis',
      'QmdBgKA8h3VA49M1Q952FUkVjGoKaHvbtLY8QZsYBLXriM',
      '0x01'
    ])
*/
//    .from(mappedMintVout)
//    .from(mappedUploadVout)
//    .from(mappedFundingVout)
    .to(contractToSLPAddr, dust)
    .to(contractToSLPAddr, dust)
//    .to(contract.address, remainder)
//    .to(contract.address, changeAmount)
//    .withHardcodedFee(2000)
//    .withMinChange(2000)
    .meep();

  console.log('transaction details:', stringify(tx));
})();
