contract Dispenser {
  uint maxValue;
  uint balance;
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

  function deposit() public payable onlyOwner {
    balance += msg.value;
  }

  function withdraw() public {
    require(msg.sender == recipient);
    require(address(this).balance > 0);
    require(block.timestamp > lastWithdrawalTime + 30 days);
    uint value = maxValue < balance ? maxValue : balance;
    payable(msg.sender).transfer(value);
    lastWithdrawalTime = block.timestamp;
    balance -= value;
  }
}

