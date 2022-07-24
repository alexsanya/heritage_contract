pragma solidity >=0.8.4 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Test token", "TEST") {
      _mint(msg.sender, initialSupply);
    }
}
