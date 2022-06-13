// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

struct Successor {
  string name;
  uint share;
  address wallet;
  uint maxPerMonth;
}

contract Heritage {
  address payable owner;
  uint public numberOfSuccessors;
  uint lastPingTime;
  uint maxPeriodOfSilense;
  uint32 successorsListVersion;
  mapping(bytes32 => Successor) public successors;
  mapping(address => bool) public potentialSuccessors;

  event Deposit(uint amount);
  event Withdrowal(uint amount);
  event SetSuccessors();

  constructor() {
    owner = payable(msg.sender);
    numberOfSuccessors = 0;
    successorsListVersion = 0;
    lastPingTime = block.timestamp;
    maxPeriodOfSilense = 15 seconds;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function deposit() public payable {
    require(msg.sender == owner);
    emit Deposit(msg.value);
  }

  function withdraw(uint amount) public onlyOwner {
    owner.transfer(amount);
    emit Withdrowal(amount);
  }

  function setSuccessors(Successor[] calldata newSuccessors) public onlyOwner {
    uint total = 0;
    successorsListVersion++;
    for (uint i=0; i<newSuccessors.length; i++) {
      require(potentialSuccessors[newSuccessors[i].wallet]);
      total += newSuccessors[i].share;
      bytes32 key = keccak256(abi.encodePacked(successorsListVersion, newSuccessors[i].wallet));
      successors[key] = newSuccessors[i];
      numberOfSuccessors += 1;
    }
    require(total == 100, "sum of shares should be equal to 100");
    emit SetSuccessors();
  }

  function checkIfImSuccessor() public view returns (bool){
    bytes32 key = keccak256(abi.encodePacked(successorsListVersion, msg.sender));
    return successors[key].share > 0;
  }

  function registerSuccessorApplicant() public {
    potentialSuccessors[msg.sender] = true;
  }

  function resetCountdownTimer() public onlyOwner {
    lastPingTime = block.timestamp;
  }

  function claimHeritage() public {
    bytes32 key = keccak256(abi.encodePacked(successorsListVersion, msg.sender));
    require(successors[key].share > 0);
    require((lastPingTime + maxPeriodOfSilense) < block.timestamp);
    payable(msg.sender).transfer(address(this).balance / 100 * successors[key].share);
    delete successors[key];
  }

}
