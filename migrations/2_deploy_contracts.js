var Token = artifacts.require("TestToken");
var Heritage = artifacts.require("Heritage");

module.exports = function(deployer) {
  const SEVEN_DAYS = 60*60*24*7;

  deployer.deploy(Token, "10000").then(({ address }) => {
    deployer.deploy(Heritage, address, SEVEN_DAYS).catch(error => {
      console.log(error);
    });
  }).catch(error => console.log(error));
};
