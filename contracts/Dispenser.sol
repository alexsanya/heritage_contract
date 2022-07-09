contract Dispenser {
  uint maxValue;
  uint public balance;
  address owner;
  address recipient;
  uint lastWithdrawalTime;

  event FundsSentToRecipient(address wallet, uint value);
  event FundsReceived(uint value);

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

  receive() external payable onlyOwner {
    emit FundsReceived(msg.value);
    balance += msg.value;
  }

  function withdraw() public onlyOwner {
    require(address(this).balance > 0);
    require(block.timestamp > lastWithdrawalTime + 30 days);
    uint value = maxValue < balance ? maxValue : balance;
    bool sent = payable(recipient).send(value);
    emit FundsSentToRecipient(recipient, value);
    require(sent, "Failed to send Ether");
    lastWithdrawalTime = block.timestamp;
    balance -= value;
  }
}

