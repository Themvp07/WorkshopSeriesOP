//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract ChainJourney{

    struct Learner{
        address from;
        string learning;
    }

    Learner[] allLearnes;

    function getAllLearners() public view returns(Learner[] memory){
        return allLearnes;
    }

    function addLearner(string memory learning) public {
        allLearnes.push(Learner(msg.sender,learning));
    }
}
