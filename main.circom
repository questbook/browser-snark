pragma circom 2.0.0;

include "./circomlib/poseidon.circom";

template Preimage(){
    signal input preimage;
    signal input nonce;
    signal input required;
    signal output result;

    component hash_of_preimage = Poseidon(1);
    hash_of_preimage.inputs[0] <== preimage;
    component hash_of_hop_and_nonce = Poseidon(2);
    hash_of_hop_and_nonce.inputs[0] <== hash_of_preimage.out;
    hash_of_hop_and_nonce.inputs[1] <== nonce;
    component hash_of_required_and_nonce = Poseidon(2);
    hash_of_required_and_nonce.inputs[0] <== required;
    hash_of_required_and_nonce.inputs[1] <== nonce;
    result <== hash_of_hop_and_nonce.out * hash_of_required_and_nonce.out;
    hash_of_hop_and_nonce.out === hash_of_required_and_nonce.out;
}

component main { public [ nonce, required ] } = Preimage();