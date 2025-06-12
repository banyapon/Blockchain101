// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Election {
    string[] public candidates;
    mapping(string => uint256) public votes;
    mapping(address => bool) public hasVoted;
    constructor(string[] memory _candidates) {
        candidates = _candidates;
    }

    //Function to vote for a candidate
    function vote(string memory _candidate) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        bool valid = false;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (keccak256(abi.encodePacked(candidates[i])) == keccak256(abi.encodePacked(_candidate))) {
                valid = true;
                break;
            }
        }
        require(valid, "Candidate does not exist.");
        votes[_candidate]++;
        hasVoted[msg.sender] = true;
    }
    
    function getVotes(string memory _candidate) public view returns (uint256) {
        return votes[_candidate];
    }
}