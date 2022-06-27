const BigNumber = require("bignumber.js");
const helper = require('./utils');
const Dispenser = artifacts.require("Dispenser");

contract("Dispenser", (accounts) => {
  let dispenser;
  
  const getContractBalance = () => web3.eth.getBalance(dispenser.address);

  beforeEach(async () => {
    dispenser = await Dispenser.new(web3.utils.toWei("2", "ether") , accounts[1]);
  });

  it("should let owner to make deposit", async () => {
    await dispenser.deposit({ from: accounts[0], value: "1000" });
    const balance = await getContractBalance();
    assert.equal(balance, "1000")
  });

  it("should prevent anyone other than owner from making deposit", async () => {
    try {
      await dispenser.deposit({ from: accounts[1], value: "1000" });
    } catch (err) {
      assert.equal(await getContractBalance(), "0");
      return;
    }
    assert(false);
  });

  it("should let recipient to withdraw the rest of funds if contract balance less than maximal amount", async () => {
    await dispenser.deposit({ value: web3.utils.toWei("1", "ether") });
    const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
    const { receipt } = await dispenser.withdraw({ from: accounts[1] });
    const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
    const gasUsed = BigNumber(receipt.gasUsed).multipliedBy(receipt.effectiveGasPrice);
    assert.equal(balanceAfter.toString(), balanceBefore.minus(gasUsed).plus(web3.utils.toWei("1", "ether")).toString());
  })

  it("should let recipient to withdraw maxAmount of funds if contract balance higher than maximal amount", async () => {
    await dispenser.deposit({ value: web3.utils.toWei("3", "ether") });
    const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
    const { receipt } = await dispenser.withdraw({ from: accounts[1] });
    const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
    const gasUsed = BigNumber(receipt.gasUsed).multipliedBy(receipt.effectiveGasPrice);
    assert.equal(balanceAfter.toString(), balanceBefore.minus(gasUsed).plus(web3.utils.toWei("2", "ether")).toString());
  })


  it("should not let to withdraw to non-recipient", async () => {
    await dispenser.deposit({ value: web3.utils.toWei("1", "ether") });
    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[2] });
    } catch (error) {
      assert(true);
      return;
    }
    assert(false);
  })

  it("should let to withdraw not often than once a month", async () => {
    await dispenser.deposit({ value: web3.utils.toWei("3", "ether") });
    await dispenser.withdraw({ from: accounts[1] });
    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[1] });
    } catch (error) {
      const ONE_MONTH_AND_ONE_DAY = 3600*24*31;
      await helper.advanceTimeAndBlock(ONE_MONTH_AND_ONE_DAY);
      const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
      const { receipt } = await dispenser.withdraw({ from: accounts[1] });
      const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
      const gasUsed = BigNumber(receipt.gasUsed).multipliedBy(receipt.effectiveGasPrice);
      assert.equal(balanceAfter.toString(), balanceBefore.minus(gasUsed).plus(web3.utils.toWei("1", "ether")).toString());
      return;
    }
    assert(false);
  })



})
