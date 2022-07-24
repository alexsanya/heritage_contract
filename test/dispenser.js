const BigNumber = require("bignumber.js");
const helper = require('./utils');
const Dispenser = artifacts.require("Dispenser");
const TestToken = artifacts.require("TestToken");

contract("Dispenser", (accounts) => {
  let dispenser;
  
  const getContractBalance = () => token.balanceOf(dispenser.address);

  beforeEach(async () => {
    token = await TestToken.new("10000", { from: accounts[2] });
    dispenser = await Dispenser.new(token.address, 100, accounts[1]);
  });

  const checkBalanceChange = async (correctValue) => {
    const contractBalance = await getContractBalance();
    const recordBalance = await dispenser.balance();

    assert.equal(contractBalance, correctValue);
    assert.equal(recordBalance.toString(), correctValue);
  }

  it("should let owner to make deposit", async () => {
    await token.transfer(accounts[0], 1000, { from: accounts[2] })
    await token.approve(dispenser.address, 1000);
    await dispenser.receiveTokens(1000);
    await checkBalanceChange("1000");
  });

  it("should prevent anyone other than owner from making deposit", async () => {
    try {
      await token.approve(dispenser.address, 1000, { from: accounts[2] });
      await dispenser.receiveTokens(1000, { from: accounts[2] });
    } catch (err) {
      await checkBalanceChange("0");
      return;
    }
    assert(false);
  });

  it("should let recepient to withdraw the rest of funds if contract balance less than maximal amount", async () => {
    await token.transfer(accounts[0], 50, { from: accounts[2] });
    await token.approve(dispenser.address, 50);
    await dispenser.receiveTokens(50);

    const balanceBefore = await token.balanceOf(accounts[1]);
    const { receipt } = await dispenser.withdraw();
    const balanceAfter = await token.balanceOf(accounts[1]);
    assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 50);
  });

  it("should let recepient to withdraw maxAmount of funds if contract balance higher than maximal amount", async () => {
    await token.transfer(accounts[0], 150, { from: accounts[2] });
    await token.approve(dispenser.address, 150);
    await dispenser.receiveTokens(150);

    const balanceBefore = await token.balanceOf(accounts[1]);
    const { receipt } = await dispenser.withdraw({ from: accounts[0] });
    const balanceAfter = await token.balanceOf(accounts[1]);
    assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 100);
  });

  it("should not let to withdraw to non-owner", async () => {
    await token.transfer(accounts[0], 100, { from: accounts[2] });
    await token.approve(dispenser.address, 100);
    await dispenser.receiveTokens(100);

    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[1] });
    } catch (error) {
      const balance = await token.balanceOf(accounts[1]);
      assert.equal(balance, 0);
      return;
    }
    assert(false);
  });

  it("should let to withdraw not often than once a month", async () => {
    await token.transfer(accounts[0], 300, { from: accounts[2] });
    await token.approve(dispenser.address, 300);
    await dispenser.receiveTokens(300);

    await dispenser.withdraw({ from: accounts[0] });
    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[0] });
    } catch (error) {
      const ONE_MONTH_AND_ONE_DAY = 3600*24*31;
      await helper.advanceTimeAndBlock(ONE_MONTH_AND_ONE_DAY);
      const balanceBefore = await token.balanceOf(accounts[1]);
      const { receipt } = await dispenser.withdraw({ from: accounts[0] });
      const balanceAfter = await token.balanceOf(accounts[1]);
      assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 100);
      return;
    }
    assert(false);
  })



})
