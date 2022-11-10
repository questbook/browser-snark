const {groth16} = require("snarkjs");
const main = require('./main_b64.json');
const arraybuffer = require('base64-arraybuffer');

export async function generateProof(input, wasmPath, zkeyPath) {
    console.log(main['main.wasm']);
    const wasmBuffer = arraybuffer.decode(main['main_js/main.wasm'], 'base64');
    const zkeyBuffer = arraybuffer.decode(main['main_0001.zkey'], 'base64');
    console.log(wasmBuffer);
    const wasmFile = new File([wasmBuffer], 'main.wasm');
    const zkeyFile = new File([zkeyBuffer], 'main.zkey');
    console.log(zkeyFile, zkeyFile.name, zkeyFile.type);
  const { proof: _proof, publicSignals: _publicSignals } =
    await groth16.fullProve(input, 'https://github.com/hello', zkeyFile.name );

  const calldata = await groth16.exportSolidityCallData(_proof, _publicSignals);
  console.log(calldata);
}