# Browser SNARK
A javascript library to generate SNARKs in a browser. Developers can use this library to quickly setup zk-proofs in their applications. 

These zk-proofs can be submitted on chain. The proof verification also ensures that one proof is used exactly once on chain. 

## Installation
### Next.js

```
npm install browser-snark
```

Add the following to your `.babel.rc`
```
{
    "presets": [
      [
        "next/babel",
        {
          "preset-env": {
            // "debug": true,
            "targets": [
              "last 2 Edge versions",
              "last 2 Opera versions",
              "last 2 Safari versions",
              "last 2 Chrome versions",
              "last 2 Firefox versions"
            ]
          }
        }
      ]
    ]
  }
```

Add the following to your next.config.js
```
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }
    config.experiments = { asyncWebAssembly: true };
    return config;
  },
}

module.exports = nextConfig
```

## Usage for SNARK Proofs
The following SNARK proofs can be generated and verified using this library

### Preimage of Hash
You can prove that the user knows the preimage of a hash and verify it on a smart contract.
#### Smart Contract
Add the following interface to your contract
```
interface Verifier {
function verifyWithNonce(            
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[3] memory input
    ) external returns(bool);
}
```

In your constructor instantiate the verifier;
```
    Verifier verifier;
    constructor() {
        verifier = Verifier(<CONTRACT ADDRESS>);
        // refer below table fot the contract address depending on the chain
    }
```
| Chain | address |
|-------|---------|
| Goerli | `0x9247fbEB6195dF258A701D5749dD21b4696c1C22` |
| Optimism Mainnet | `0x7BA977e10e6f0EB05f3D6f4C1AB44626258e1d83` |
| Polygon Mainnet | `0xa932B4b9eeE2B098766828aa6E0803820ad3a064` |
| Ethereum Mainnet | `Coming soon...` |

In your function where you want to execute some logic only if proof is valid you need to do 3 steps
1. Add 4 new parameters to your function `uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[3] memory input`
2. On the top of this function add `require(verifier.verifyWithNonce(a,b,c, input), "Invalid proof");`
3. Verify that the proof was generated for the correct hash

For example
```
function yourFunction(uint yourParam1, uint yourParam2, uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[3] memory input) public {
    require(verifier.verifyWithNonce(a,b,c, input), "Invalid proof");
    require(input[2] == EXPECTED_HASH, "Proof generated for wrong hash");
    
    //... Your logic
}
```

#### Javascript

Import `browser-snark` and create an object
```
import {Preimage} from 'browser-snark'
...
preimage = new Preimage();
...
```

Generate poseidon hash
```
myHash = preimage.hash(value)
```

Generate proof
```
if(myHash == EXPECTED_HASH){
    const proof = preimage.generateProof(value, EXPECTED_HASH);
    //... submit proof
}
```

Submit transaction with proof
```
    contractWithSigner.yourFunction(yourParam1, yourParam2, proof.a, proof.b, proof.c, proof.input)
```

 


## Todo
- Generate nonce from msg.sender