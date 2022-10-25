const BigNumber = require("bignumber.js");
const Factory = artifacts.require("Factory");
const Heritage = artifacts.require("Heritage");
const TestToken = artifacts.require("TestToken");
const helper = require('./utils');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Heritage", (accounts) => {
  let heritage;
  let token;

  const getContractBalance = () => web3.eth.getBalance(heritage.address);

  const SEVEN_DAYS = 60*60*24*7;

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    const SECONDS_IN_WEEK = 7*24*3600;
    const factory = await Factory.new();
    token = await TestToken.new("10000", { from: accounts[1] });
    await factory.create("Testament", token.address, SECONDS_IN_WEEK);
    const contractAddress = await factory.ownerToContracts(accounts[0], 0);
    heritage = await Heritage.at(contractAddress);
  });

  it("should let owner to withdraw tokens", async () => {
    await token.transfer(accounts[0], "1000", { from: accounts[1] });
    await token.approve(heritage.address, 1000);
    await heritage.depositTokens("1000");
    await heritage.withdrawTokens("1000");
    const tokenBalance = await token.balanceOf(accounts[0]);
    assert.equal(tokenBalance.toString(), "1000");
  });

  it("should not let anyone other than owner to withdraw tokens", async () => {
    await token.transfer(heritage.address, "1000", { from: accounts[1] });
    try {
      await heritage.withdrawTokens("1000", { from: accounts[2] });
    } catch (err) {
      const tokenBalance = await token.balanceOf(accounts[2]);
      assert.equal(tokenBalance.toString(), "0");
      return;
    }

    assert(false);
  });



  it("should let owner to make eth deposit", async () => {
    await heritage.deposit({ from: accounts[0], value: "1000" });
    const balance = await getContractBalance();
    assert.equal(balance, "1000")
  })

  it("should prevent anyone other than owner from making deposit", async () => {
    try {
      await heritage.deposit({ from: accounts[1], value: "1000" });
    } catch (err) {
      assert.equal(await getContractBalance(), "0");
      return;
    }
    assert(false);
  })

  it("should register potential successor", async () => {
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    const isPresented = await heritage.potentialSuccessors(accounts[1]);
    assert(isPresented);
  })

  it("should let owner to add successors if successor is registered", async () => {
    const successors = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[1],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ];
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.setSuccessors(successors);
    const numberOfSuccessors = await heritage.numberOfSuccessors();
    assert.equal(numberOfSuccessors, "1");
    assert(await heritage.checkIfImSuccessor({ from: accounts[1] }));
    const successorFromList = await heritage.listOfSuccessors(0);
    assert.equal(successorFromList, accounts[1]);

  })

  it("should let owner to replace successors list", async () => {
    const successorsInitial = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[1],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ];

    const successorsNew = [
      {
        name: "Bob",
        share: "100",
        wallet: accounts[2],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ]
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.registerSuccessorApplicant({ from: accounts[2] });
    await heritage.setSuccessors(successorsInitial);
    const numberOfSuccessors = await heritage.numberOfSuccessors();
    assert.equal(numberOfSuccessors, "1");
    assert(await heritage.checkIfImSuccessor({ from: accounts[1] }));
    assert.equal(await heritage.checkIfImSuccessor({ from: accounts[2] }), false);

    await heritage.setSuccessors(successorsNew);
    assert.equal(numberOfSuccessors, "1");
    assert(await heritage.checkIfImSuccessor({ from: accounts[2] }));
    assert.equal(await heritage.checkIfImSuccessor({ from: accounts[1] }), false);
    const successorFromList = await heritage.listOfSuccessors(0);
    assert.equal(successorFromList, accounts[2]);
  })


  it("should not let owner to add successors if successor isn't registered", async () => {
    const successors = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[1].address,
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ];
    try { 
      await heritage.setSuccessors(successors);
    } catch (error) {
      const numberOfSuccessors = await heritage.numberOfSuccessors();
      assert.equal(numberOfSuccessors, "0");
      return;
    }
    assert(false);
  })


  it("should not let anyone other than owner to add successors", async () => {
    const successors = [
      {
        name: "Alex",
        share: "100",
        wallet: "0x9Fe0Ffc3070f7112a745A7D9250b8580a7cAE0eE",
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ];
    try { 
      await heritage.setSuccessors(successors, { from: accounts[1] });
    } catch (error) {
      const numberOfSuccessors = await heritage.numberOfSuccessors();
      assert.equal(numberOfSuccessors, "0");
      return;
    }
    assert(false);
  })

  it("should let owner to add successors if sum of shares is equal to 100", async () => {
    const successors = [
      {
        name: "Alex",
        share: "50",
        wallet: accounts[1],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      },
      {
        name: "Bob",
        share: "50",
        wallet: accounts[2],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }

    ];
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.registerSuccessorApplicant({ from: accounts[2] });
    await heritage.setSuccessors(successors);
    const numberOfSuccessors = await heritage.numberOfSuccessors();
    assert.equal(numberOfSuccessors, "2");

    const [firstSuccessor, secondSuccessor] = await Promise.all([
      heritage.listOfSuccessors(0),
      heritage.listOfSuccessors(1),
    ]);
    assert.equal(firstSuccessor, accounts[1]);
    assert.equal(secondSuccessor, accounts[2]);

  })

  it("should fail to add successors if sum of shares is other than 100", async () => {
    const successors = [
      {
        name: "Alex",
        share: "50",
        wallet: accounts[1],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      },
      {
        name: "Bob",
        share: "20",
        wallet: accounts[2],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }

    ];
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.registerSuccessorApplicant({ from: accounts[2] });
    try {
      await heritage.setSuccessors(successors);
    } catch (error) {
      const numberOfSuccessors = await heritage.numberOfSuccessors();
      assert.equal(numberOfSuccessors, "0");
      return;
    }
    assert(false);
  })

  it("should let owner to reset timer", async () => {
    await heritage.resetCountdownTimer();
    const lastBlockTimestamp = (await web3.eth.getBlock('latest')).timestamp;
    const countdownValue = await heritage.getCountdownValue();
    assert.equal(lastBlockTimestamp, countdownValue.toString());
  })

  it("should not let any other account to reset timer", async () => {
    try {
      await heritage.resetCountdownTimer({ from: accounts[1] });
    } catch (error) {
      assert(true);
      return;
    }
    assert(false);
  })

  it("should return true on isFundsReleaseAvailible when deadline expired", async() => {
    await helper.advanceTimeAndBlock(SEVEN_DAYS);
    const isFundsReleaseAvailible = await heritage.isFundsReleaseAvailible();
    assert.equal(isFundsReleaseAvailible, true);
  });

  it("should return false on isFundsReleaseAvailible when deadline isnt expired", async() => {
    const isFundsReleaseAvailible = await heritage.isFundsReleaseAvailible();
    assert.equal(isFundsReleaseAvailible, false);
  });

  describe("Withdrawal of shares" , () => {

    let snapshotId;

    before(async () => {
      snapshotId = await helper.takeSnapshot();
    })

    beforeEach(async () => {
      const successors = [
        {
          name: "Alex",
          share: "70",
          wallet: accounts[1],
          dispenser: ZERO_ADDRESS,
          fundsBeenReleased: false,
          maxPerMonth: 2
        },
        {
          name: "Bob",
          share: "30",
          wallet: accounts[2],
          dispenser: ZERO_ADDRESS,
          fundsBeenReleased: false,
          maxPerMonth: 10
        }
      ];

      await helper.revertToSnapShot(snapshotId);

      await heritage.registerSuccessorApplicant({ from: accounts[1] });
      await heritage.registerSuccessorApplicant({ from: accounts[2] });
      await heritage.setSuccessors(successors);

      await token.transfer(accounts[0], "100", { from: accounts[1] });
      await token.approve(heritage.address, "100");
      await heritage.depositTokens("100")

      await heritage.deposit({ value: web3.utils.toWei("10", "ether") });
      await heritage.updateMaxPeriodOfSilence(SEVEN_DAYS);
    });

    it("should let a successor to claim his share after deadline have past", async () => {
      await helper.advanceTimeAndBlock(SEVEN_DAYS);
      await (async () => { //Alex claims share
        const balanceBefore = await token.balanceOf(accounts[1]);
        const { receipt } = await heritage.claimHeritage({ from: accounts[1] });
        const balanceAfter = await token.balanceOf(accounts[1]);

        assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 2);
      })()
      await (async () => { //Bob claims share
        const balanceBefore = await token.balanceOf(accounts[2]);
        const { receipt } = await heritage.claimHeritage({ from: accounts[2] });
        const balanceAfter = await token.balanceOf(accounts[2]);
        assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 10);
      })()

    });


    it("should let a successor to claim his share monthly", async () => {
      const ONE_MONTH_AND_ONE_DAY = 3600*24*31;

      await helper.advanceTimeAndBlock(SEVEN_DAYS);
      await (async () => { //Alex claims share
        const balanceBefore = await token.balanceOf(accounts[1]);
        const { receipt } = await heritage.claimHeritage({ from: accounts[1] });
        const balanceAfter = await token.balanceOf(accounts[1]);
        assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 2);
      })()
      await helper.advanceTimeAndBlock(ONE_MONTH_AND_ONE_DAY);
      await (async () => { //Alex claims share again
        const balanceBefore = await token.balanceOf(accounts[1]);
        const { receipt } = await heritage.claimHeritage({ from: accounts[1] });
        const balanceAfter = await token.balanceOf(accounts[1]);
        assert.equal(balanceAfter.toNumber(), balanceBefore.toNumber() + 2);
      })()

    });


    it("should prevent successor from claiming his share if deadline haven't passed", async () => {
      await helper.advanceTimeAndBlock(Math.round(SEVEN_DAYS / 2));
      try {
        await heritage.claimHeritage({ from: accounts[1] });
      } catch (error) {
        assert(true);
        return;
      }
      assert(false);
    });

    it("should prevent non-successor from claiming the share after deadline have past", async () => {
      await helper.advanceTimeAndBlock(Math.round(SEVEN_DAYS));
      try {
        await heritage.claimHeritage({ from: accounts[3] });
      } catch (error) {
        assert(true);
        return;
      }
      assert(false);
    });

  });

});
