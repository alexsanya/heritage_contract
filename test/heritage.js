const Heritage = artifacts.require("Heritage");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Heritage", (accounts) => {
  let heritage;

  const getBallance = () => web3.eth.getBalance(heritage.address);

  beforeEach(async () => {
    heritage = await Heritage.new();
  });

  it("should let owner to make deposit", async () => {
    await heritage.deposit({ from: accounts[0], value: "1000" });
    const ballance = await getBallance();//web3.eth.getBalance(heritage.address);
    assert.equal(ballance, "1000")
  })

  it("should prevent anyone other than owner from making deposit", async () => {
    try {
      await heritage.deposit({ from: accounts[1], value: "1000" });
    } catch (err) {
      assert.equal(await getBallance(), "0");
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
        maxPerMonth: "1000000"
      }
    ];
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.setSuccessors(successors);
    const numberOfSuccessors = await heritage.numberOfSuccessors();
    assert.equal(numberOfSuccessors, "1");
    assert(await heritage.checkIfImSuccessor({ from: accounts[1] }));
  })

  it("should let owner to replace successors list", async () => {
    const successorsInitial = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[1],
        maxPerMonth: "1000000"
      }
    ];

    const successorsNew = [
      {
        name: "Bob",
        share: "100",
        wallet: accounts[2],
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
  })


  it("should not let owner to add successors if successor isn't registered", async () => {
    const successors = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[1].address,
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
        maxPerMonth: "1000000"
      },
      {
        name: "Bob",
        share: "50",
        wallet: accounts[2],
        maxPerMonth: "1000000"
      }

    ];
    await heritage.registerSuccessorApplicant({ from: accounts[1] });
    await heritage.registerSuccessorApplicant({ from: accounts[2] });
    await heritage.setSuccessors(successors);
    const numberOfSuccessors = await heritage.numberOfSuccessors();
    assert.equal(numberOfSuccessors, "2");
  })

  it("should fail to add successors if sum of shares is other than 100", async () => {
    const successors = [
      {
        name: "Alex",
        share: "50",
        wallet: accounts[1],
        maxPerMonth: "1000000"
      },
      {
        name: "Bob",
        share: "20",
        wallet: accounts[2],
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

});
