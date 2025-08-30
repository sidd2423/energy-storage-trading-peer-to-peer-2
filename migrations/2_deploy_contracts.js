const PtoP = artifacts.require("PtoP");
const BatteryInvestment = artifacts.require("BatteryInvestment");
const BatteryEnergy = artifacts.require("BatteryEnergy");

module.exports = function (deployer) {
  deployer.deploy(PtoP).then(() => {
    deployer.deploy(BatteryInvestment, PtoP.address, 2);
    deployer.deploy(BatteryEnergy, PtoP.address);
  });
};