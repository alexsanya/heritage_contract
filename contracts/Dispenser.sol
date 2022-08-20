import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Dispenser {
  uint maxValue;
  uint public balance;
  address owner;
  address recipient;
  IERC20 token;
  uint public lastWithdrawalTime;
  uint public totalWithdrawed;

  event FundsSentToRecipient(address wallet, uint value);
  event FundsReceived(uint value);

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  constructor(IERC20 tokenAddress, uint perMonth, address rec) {
    owner = payable(msg.sender);
    maxValue = perMonth;
    lastWithdrawalTime = 0;
    recipient = rec;
    balance = 0;
    token = tokenAddress;
  }

  function receiveTokens(uint amount) external onlyOwner {
    uint erc20balance = token.balanceOf(owner);
    require(amount <= erc20balance, "Insufficient funds");
    bool sent = token.transferFrom(owner, address(this), amount);
    require(sent, "Failed to send tokens");
    balance += amount;
    emit FundsReceived(amount);
  }

  function withdraw() public onlyOwner {
    uint256 erc20balance = token.balanceOf(address(this));
    require(erc20balance > 0);
    require(block.timestamp > lastWithdrawalTime + 30 days);
    uint value = maxValue < erc20balance ? maxValue : erc20balance;
    bool sent = token.transfer(recipient, value);
    require(sent, "Failed to send tokens");
    emit FundsSentToRecipient(recipient, value);
    totalWithdrawed += value;
    lastWithdrawalTime = block.timestamp;
    balance -= value;
  }
}

