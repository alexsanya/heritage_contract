pragma solidity >=0.8.4 <0.9.0;

import "./Heritage.sol";

contract Factory {
  mapping(address => address[]) public ownerToContracts;
  mapping(address => uint) public ownerToContractsNumber;
  mapping(address => address[]) public successorToContracts;
  mapping(address => uint) public contractToSuccessorNumber;
  mapping(address => uint) public successorToContractsNumber;
  mapping(address => string) public contractNames;

  function create(string calldata name, address token, uint secondsToRelease) public {
    Heritage newContract = new Heritage(secondsToRelease, token, msg.sender, address(this));
    contractNames[address(newContract)] = name;
    ownerToContracts[msg.sender].push(address(newContract));
    ownerToContractsNumber[msg.sender] += 1;
  }

  function setSuccessor(Successor calldata newSuccessor) public {
    require(bytes(contractNames[msg.sender]).length > 0, "Contract doesn't exists");
    successorToContracts[newSuccessor.wallet].push(msg.sender);
    successorToContractsNumber[newSuccessor.wallet] += 1;
    contractToSuccessorNumber[msg.sender] += 1;
  }
}
