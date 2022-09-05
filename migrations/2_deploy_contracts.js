var Token = artifacts.require("TestToken");
var Heritage = artifacts.require("Heritage");
var Factory = artifacts.require("Factory");

module.exports = function(deployer) {
  //const SEVEN_DAYS = 60*60*24*7;

  //deployer.deploy(Factory);

  //return deployer.deploy(Token, "10000").then(({ address }) => {
  //  const deployTestament = deployer.deploy(Heritage, address, SEVEN_DAYS).catch(error => {
  //    console.log(error);
  //  });
  //  const deployFactory = deployer.deploy(Factory);
  //
  //  return Promise.all([deployTestament, deployFactory]);
  //}).catch(error => console.log(error));

  return Promise.all([
    deployer.deploy(Factory),
    deployer.deploy(Token, "10000")
  ]);

};
