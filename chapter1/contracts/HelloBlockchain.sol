//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloBlockchain {
    string public message = "Hello, Blockchain!";

    function setMessage(string memory _msg) public {
        message = _msg;
    }
    
    // Function to retrieve the current message
    function getMessage() public view returns (string memory) {
        return message;
    }
}