import { ethers } from "ethers";

const {groth16} = require("snarkjs");
const main = require('./main_b64.json');
const arraybuffer = require('base64-arraybuffer');
const supportedChains = require('./supported-chains.json');
const poseidon = require('./preimage/poseidon');

class Verifiable {
  verifierContractAbi = [
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "a",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[2][2]",
          "name": "b",
          "type": "uint256[2][2]"
        },
        {
          "internalType": "uint256[2]",
          "name": "c",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[3]",
          "name": "input",
          "type": "uint256[3]"
        }
      ],
      "name": "verifyWithNonce",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        }
      ],
      "name": "isNonceUsed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "a",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[2][2]",
          "name": "b",
          "type": "uint256[2][2]"
        },
        {
          "internalType": "uint256[2]",
          "name": "c",
          "type": "uint256[2]"
        },
        {
          "internalType": "uint256[3]",
          "name": "input",
          "type": "uint256[3]"
        }
      ],
      "name": "verifyProof",
      "outputs": [
        {
          "internalType": "bool",
          "name": "r",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  async getNonce(provider) {
    const network = await provider.getNetwork();
    console.log("Network", network);
    const contract = new ethers.Contract(supportedChains[network.chainId].verifier_contract, this.verifierContractAbi, provider);
    while(true){
      let nonce = Math.floor(Math.random() * 1000000000000000000).toString();
      console.log("Nonce", nonce);
      let isUsed = await contract.isNonceUsed(ethers.BigNumber.from(nonce));
      if(!isUsed){
        return nonce;
      }
    }
  }
  gateway() {
    try{
      return process.env.IPFS_RPC_ENDPOINT  
    }
    finally{
      return "https://browser-snark.infura-ipfs.io/ipfs/"
    }
  }
  ipfsPath(ipfsHash) {
    return `${this.gateway()}${ipfsHash}`;
  }


}

export class Preimage extends Verifiable {
    provider = null;
    constructor(provider) {
      super();
      this.provider = provider;
    }
    wasmIpfsPath = this.ipfsPath("QmYoxY8KwJULF2chm5MNiFsoGjPsdiNYCrnJtNtDjaQ2mR");
    zkeyIpfsPath = this.ipfsPath("QmNcbnSLjW7cLHamYHvFepz481zsyc9ePkRN7R8PDSNqpe");
    async generateProof(preimage, hash) {
      const input = {
        preimage,
        required: hash,
        nonce: await this.getNonce(this.provider)
      }
      console.log("Input", input);
      const { proof: _proof, publicSignals: _publicSignals } =
        await groth16.fullProve(input, this.wasmIpfsPath, this.zkeyIpfsPath);
    
      const calldataRaw = await groth16.exportSolidityCallData(_proof, _publicSignals);  
      console.log(calldataRaw);
      const calldataArray = JSON.parse("["+ calldataRaw + "]");
      console.log(calldataArray);
      return {
        a: calldataArray [0], 
        b: calldataArray [1],
        c: calldataArray [2],
        input: calldataArray [3],
      };
    }

    hash(value) {
      console.log(poseidon([value]).toString());
      return poseidon([value]).toString().split('n')[0];
      
    }
}

