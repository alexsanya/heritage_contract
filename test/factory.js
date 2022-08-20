const TestToken = artifacts.require("TestToken");
const Factory = artifacts.require("Factory");
const Heritage = artifacts.require("Heritage");

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("Factory", (accounts) => {
  let factory;
  let token;

  beforeEach(async () => {
    token = await TestToken.new("10000", { from: accounts[1] });
    factory = await Factory.new();
  });

  it("Should create new contract", async () => {
    await factory.create("New testament", token.address, 100);
    const ownedContracts = await factory.ownerToContractsNumber(accounts[0]);
    assert.equal(ownedContracts, 1);
    const contractAddress = await factory.ownerToContracts(accounts[0], 0);
    const heritage = await Heritage.at(contractAddress);
    const silencePeriod = await heritage.maxPeriodOfSilense();
    assert.equal(silencePeriod.toNumber(), 100);
    const contractName = await factory.contractNames(contractAddress);
    assert.equal(contractName, "New testament");
  });

  it.only("Should delegate setSuccessors", async () => {
    await factory.create("New testament", token.address, 100);
    const contractAddress = await factory.ownerToContracts(accounts[0], 0);
    const successors = [
      {
        name: "Alex",
        share: "100",
        wallet: accounts[2],
        dispenser: ZERO_ADDRESS,
        fundsBeenReleased: false,
        maxPerMonth: "1000000"
      }
    ];
    const heritage = await Heritage.at(contractAddress);
    await heritage.registerSuccessorApplicant({ from: accounts[2] });
    const result = await heritage.potentialSuccessors(accounts[2]);
    console.log(accounts[2]);
    console.log(result);
    await factory.setSuccessors(contractAddress, successors);
    const numberOfSuccessors = await factory.contractToSuccessorNumber(contractAddress);
    const numberOfContracts = await factory.successorToContractsNumber(accounts[2]);
    const contract = await factory.successorToContracts(accounts[2], 0);
    const successor = await factory.contractToSuccessors(contractAddress, 0);

    assert.equal(numberOfSuccessors, 1);
    assert.equal(numberOfContracts, 1);
    assert.equal(contract, contractAddress);
    assert.equal(successor, accounts[2]);
  });
})
