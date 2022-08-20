pragma solidity >=0.8.4 <0.9.0;

import "./Heritage.sol";

contract Factory {
  mapping(address => address[]) public ownerToContracts;
  mapping(address => uint) public ownerToContractsNumber;
  mapping(address => address[]) public successorToContracts;
  mapping(address => uint) public successorToContractsNumber;
  mapping(address => address[]) public contractToSuccessors;
  mapping(address => uint) public contractToSuccessorNumber;
  mapping(address => string) public contractNames;

  function create(string calldata name, address token, uint daysToRelease) public {
    Heritage newContract = new Heritage(daysToRelease, token);
    contractNames[address(newContract)] = name;
    ownerToContracts[msg.sender].push(address(newContract));
    ownerToContractsNumber[msg.sender] += 1;
  }


  function setSuccessors(address contractAddress, Successor[] calldata newSuccessors) public {
    (bool success, bytes memory data) = contractAddress.delegatecall(
      abi.encodeWithSignature("setSuccessors((string,uint256,address,address,uint256,bool)[])", newSuccessors)
    );

    //(bool success, bytes memory data) = contractAddress.delegatecall(
    //  abi.encodeWithSignature("registerSuccessorApplicant()", msg.sender)
    //);


    require(success, "cannot set successors");
    contractToSuccessors[contractAddress] = new address[](0);
    for (uint i=0; i<newSuccessors.length; i++) {
      contractToSuccessors[contractAddress].push(newSuccessors[i].wallet);
      contractToSuccessorNumber[contractAddress] += 1;
      successorToContracts[newSuccessors[i].wallet].push(contractAddress);
      successorToContractsNumber[newSuccessors[i].wallet] += 1;
    }
  }
}
