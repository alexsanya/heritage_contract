const BigNumber = require("bignumber.js");
const helper = require('./utils');
const Dispenser = artifacts.require("Dispenser");

contract("Dispenser", (accounts) => {
  let dispenser;
  
  const getContractBalance = () => web3.eth.getBalance(dispenser.address);

  beforeEach(async () => {
    dispenser = await Dispenser.new(web3.utils.toWei("2", "ether") , accounts[1]);
  });

  const checkBalanceChange = async (correctValue) => {
    const contractBalance = await getContractBalance();
    const recordBalance = await dispenser.balance();

    assert.equal(contractBalance, correctValue);
    assert.equal(recordBalance.toString(), correctValue);
  }

  it("should let owner to make deposit", async () => {
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: dispenser.address,
      value: "1000"
    });
    await checkBalanceChange("1000");
  });

  it("should prevent anyone other than owner from making deposit", async () => {
    try {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: dispenser.address,
        value: "1000"
      });

    } catch (err) {
      await checkBalanceChange("0");
      return;
    }
    assert(false);
  });

  it("should let recepient to withdraw the rest of funds if contract balance less than maximal amount", async () => {
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: dispenser.address,
        value: web3.utils.toWei("1", "ether") 
    });

    const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
    const { receipt } = await dispenser.withdraw({ from: accounts[0] });
    const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
    assert.equal(balanceAfter.toString(), balanceBefore.plus(web3.utils.toWei("1", "ether")).toString());
  })

  it("should let recepient to withdraw maxAmount of funds if contract balance higher than maximal amount", async () => {
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: dispenser.address,
        value: web3.utils.toWei("3", "ether") 
    });

    const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
    const { receipt } = await dispenser.withdraw({ from: accounts[0] });
    const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
    assert.equal(balanceAfter.toString(), balanceBefore.plus(web3.utils.toWei("2", "ether")).toString());
  })


  it("should not let to withdraw to non-owner", async () => {
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: dispenser.address,
        value: web3.utils.toWei("1", "ether") 
    });

    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[1] });
    } catch (error) {
      assert(true);
      return;
    }
    assert(false);
  })

  it("should let to withdraw not often than once a month", async () => {
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: dispenser.address,
        value: web3.utils.toWei("3", "ether") 
    });

    await dispenser.withdraw({ from: accounts[0] });
    try {
      const { receipt } = await dispenser.withdraw({ from: accounts[0] });
    } catch (error) {
      const ONE_MONTH_AND_ONE_DAY = 3600*24*31;
      await helper.advanceTimeAndBlock(ONE_MONTH_AND_ONE_DAY);
      const balanceBefore = BigNumber(await web3.eth.getBalance(accounts[1]));
      const { receipt } = await dispenser.withdraw({ from: accounts[0] });
      const balanceAfter = BigNumber(await web3.eth.getBalance(accounts[1]));
      assert.equal(balanceAfter.toString(), balanceBefore.plus(web3.utils.toWei("1", "ether")).toString());
      return;
    }
    assert(false);
  })



})
