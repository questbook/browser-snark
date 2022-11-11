// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface Verifier {
function verifyWithNonce(            
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[3] memory input
    ) external returns(bool);
}

contract Test {
    Verifier verifier;
    constructor() {
        verifier = Verifier(0xa932B4b9eeE2B098766828aa6E0803820ad3a064);
    }

    uint number;

    function updateNumber(uint num, 
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[3] memory input
    ) public returns(bool) {
        require(verifier.verifyWithNonce(a,b,c, input), "Invalid proof");
        require(input[2] == 19065150524771031435284970883882288895168425523179566388456001105768498065277, "Preimage doesn't hash to the expected value");
        number = num;
        return true;
    }

    function getNumber() public view returns(uint){ 
        return number;
    }
}