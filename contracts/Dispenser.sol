contract Dispenser {
  uint maxValue;
  uint public balance;
  address owner;
  address recipient;
  uint lastWithdrawalTime;

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  constructor(uint perMonth, address rec) {
    owner = payable(msg.sender);
    maxValue = perMonth;
    lastWithdrawalTime = 0;
    recipient = rec;
    balance = 0;
  }

  fallback() external payable onlyOwner {
    balance += msg.value;
  }

  function withdraw() public onlyOwner {
    require(address(this).balance > 0);
    require(block.timestamp > lastWithdrawalTime + 30 days);
    uint value = maxValue < balance ? maxValue : balance;
    payable(recipient).transfer(value);
    lastWithdrawalTime = block.timestamp;
    balance -= value;
  }
}

