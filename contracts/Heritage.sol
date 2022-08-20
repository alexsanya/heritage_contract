// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Dispenser.sol";

struct Successor {
  string name;
  uint share;
  address wallet;
  address dispenser;
  uint maxPerMonth;
  bool fundsBeenReleased;
}

contract Heritage {
  address payable owner;
  IERC20 token;
  uint public numberOfSuccessors;
  uint lastPingTime;
  uint public maxPeriodOfSilense;
  uint totalVolume;
  uint32 successorsListVersion;
  mapping(bytes32 => Successor) public successors;
  mapping(address => bool) public potentialSuccessors;

  event Deposit(uint amount);
  event Withdrowal(uint amount);
  event TokenDeposit(uint amount);
  event TokenWithdrowal(uint amount);
  event RegisterSuccessor(address successor, bool isRegistered);
  event InvalidSuccessor(address successor);
  event SetSuccessors();
  event SuccessorClaimingShare(address successor, uint share);
  event ReleasingFunds(address dispenser, uint amount, uint balance);
  event FundsTransfered(address successor, uint amount);
  event DelegateCallToDispenser();

  constructor(uint unlockTimeline, address tokenAddress) {
    owner = payable(msg.sender);
    token = IERC20(tokenAddress);
    numberOfSuccessors = 0;
    successorsListVersion = 0;
    lastPingTime = block.timestamp;
    maxPeriodOfSilense = unlockTimeline;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function deposit() public payable onlyOwner {
    emit Deposit(msg.value);
  }

  function withdraw(uint amount) public onlyOwner {
    bool sent = owner.send(amount);
    require(sent, "Failed to sent tokens");
    emit Withdrowal(amount);
  }

  function depositTokens(uint amount) public onlyOwner {
    uint256 erc20balance = token.balanceOf(owner);
    require(amount <= erc20balance, "Insufficient balance");
    bool sent = token.transferFrom(owner, address(this), amount);
    require(sent, "Failed to send tokens");
    totalVolume += amount;
    emit TokenDeposit(amount);
  }

  function withdrawTokens(uint amount) public onlyOwner {
    uint256 erc20balance = token.balanceOf(address(this));
    require(amount <= erc20balance, "Insufficient balance");
    bool sent = token.transfer(owner, amount);
    require(sent, "Failed to sent tokens");
    totalVolume -= amount;
    emit TokenWithdrowal(amount);
  }


  function updateMaxPeriodOfSilence(uint holdingPeriod) public onlyOwner {
    maxPeriodOfSilense = holdingPeriod;
  }

  function setSuccessors(Successor[] calldata newSuccessors) public {//onlyOwner {
    emit InvalidSuccessor(msg.sender);
    uint total = 0;
    successorsListVersion++;
    for (uint i=0; i<newSuccessors.length; i++) {
      emit InvalidSuccessor(newSuccessors[i].wallet);
      require(potentialSuccessors[newSuccessors[i].wallet]);
      total += newSuccessors[i].share;
      bytes32 key = keccak256(abi.encodePacked(successorsListVersion, newSuccessors[i].wallet));
      successors[key] = newSuccessors[i];
      Dispenser dispenser = new Dispenser(token, newSuccessors[i].maxPerMonth, newSuccessors[i].wallet);
      successors[key].dispenser = address(dispenser);
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
    emit RegisterSuccessor(msg.sender, potentialSuccessors[msg.sender]);
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
    address dispenserAddress = successors[key].dispenser;
    Dispenser dispenser = Dispenser(dispenserAddress);
    if (successors[key].fundsBeenReleased) {
      emit DelegateCallToDispenser();
      dispenser.withdraw();
      return;
    }
    require((lastPingTime + maxPeriodOfSilense) < block.timestamp);
    uint amount = totalVolume / 100 * successors[key].share;
    emit ReleasingFunds(dispenserAddress, amount, address(this).balance);
    token.approve(dispenserAddress, amount);
    dispenser.receiveTokens(amount);
    successors[key].fundsBeenReleased = true;
    emit FundsTransfered(dispenserAddress, amount);
    dispenser.withdraw();
  }

}
