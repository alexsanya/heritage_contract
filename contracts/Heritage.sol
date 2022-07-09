// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "./Dispenser.sol";

struct Successor {
  string name;
  uint share;
  address wallet;
  Dispenser dispenser;
  uint maxPerMonth;
  bool fundsBeenReleased;
}

contract Heritage {
  address payable owner;
  uint public numberOfSuccessors;
  uint lastPingTime;
  uint public maxPeriodOfSilense;
  uint totalVolume;
  uint32 successorsListVersion;
  mapping(bytes32 => Successor) public successors;
  mapping(address => bool) public potentialSuccessors;

  event Deposit(uint amount);
  event Withdrowal(uint amount);
  event SetSuccessors();
  event SuccessorClaimingShare(address successor, uint share);
  event ReleasingFunds(address dispenser, uint amount, uint balance);
  event FundsTransfered(address successor, uint amount);
  event DelegateCallToDispenser();


  constructor() {
    owner = payable(msg.sender);
    totalVolume = address(this).balance;
    numberOfSuccessors = 0;
    successorsListVersion = 0;
    lastPingTime = block.timestamp;
    maxPeriodOfSilense = 1 weeks;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  modifier updateVolume {
    _;
    totalVolume = address(this).balance;
  }

  function deposit() public payable onlyOwner updateVolume {
    emit Deposit(msg.value);
  }

  function withdraw(uint amount) public onlyOwner updateVolume {
    owner.transfer(amount);
    emit Withdrowal(amount);
  }

  function updateMaxPeriodOfSilence(uint holdingPeriod) public onlyOwner {
    maxPeriodOfSilense = holdingPeriod;
  }

  function setSuccessors(Successor[] calldata newSuccessors) public onlyOwner {
    uint total = 0;
    successorsListVersion++;
    for (uint i=0; i<newSuccessors.length; i++) {
      require(potentialSuccessors[newSuccessors[i].wallet]);
      total += newSuccessors[i].share;
      bytes32 key = keccak256(abi.encodePacked(successorsListVersion, newSuccessors[i].wallet));
      successors[key] = newSuccessors[i];
      successors[key].dispenser = new Dispenser(newSuccessors[i].maxPerMonth, newSuccessors[i].wallet);
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

  function getCountdownValue() public onlyOwner view returns (uint) {
    return lastPingTime;
  }

  function claimHeritage() public {
    bytes32 key = keccak256(abi.encodePacked(successorsListVersion, msg.sender));
    require(successors[key].share > 0);
    emit SuccessorClaimingShare(msg.sender, successors[key].share);
    address payable dispenserAddress = payable(successors[key].dispenser);
    Dispenser dispenser = Dispenser(dispenserAddress);
    if (successors[key].fundsBeenReleased) {
      emit DelegateCallToDispenser();
      dispenser.withdraw();
      return;
    }
    require((lastPingTime + maxPeriodOfSilense) < block.timestamp);
    uint amount = totalVolume / 100 * successors[key].share;
    emit ReleasingFunds(dispenserAddress, amount, address(this).balance);
    dispenserAddress.call{value: amount}("");
    successors[key].fundsBeenReleased = true;
    emit FundsTransfered(dispenserAddress, amount);
    dispenser.withdraw();
  }

}
