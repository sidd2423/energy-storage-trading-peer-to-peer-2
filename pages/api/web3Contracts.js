const Web3 = require("web3");
const contract = require("@truffle/contract");

class web3Contracts {
  web3 = null;
  web3Provider = null;
  contracts = {};
  accounts = [];
  readOnly = false;

  constructor() {}

  init = async () => {
    await this.initWeb3();
    await this.initAccounts();
    await this.initContractTruffle();
  };

  async initWeb3() {
    console.log("initWeb3");

    if (window.ethereum) {
      this.web3Provider = window.ethereum;
      try {
        // Requesting MetaMask account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Checking for correct network (1337) and prompt to switch if wrong
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0x539") { // 0x539 hex = 1337 decimal
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x539" }]
            });
          } catch (switchError) {
            // If the chain has not been added to MetaMask, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: "0x539",
                  chainName: "Geth Dev",
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["http://34.130.223.102:8545"],
                  blockExplorerUrls: []
                }]
              });
            } else {
              throw switchError;
            }
          }
        }

        // React to account or network changes
        window.ethereum.on('accountsChanged', async () => {
          await this.initAccounts();
        });
        window.ethereum.on('chainChanged', () => window.location.reload());

      } catch (error) {
        console.error("MetaMask connection or network switch failed:", error);
        throw new Error("Please connect MetaMask to the Geth Dev network (1337).");
      }

    } else if (window.web3) {
      // Legacy dapp browsers
      this.web3Provider = window.web3.currentProvider;

    } else {
      // No wallet provider found → read‑only mode via RPC
      console.warn("No MetaMask detected — running in read-only mode");
      this.web3Provider = new Web3.providers.HttpProvider("http://34.130.223.102:8545");
      this.readOnly = true;
    }

    this.web3 = new Web3(this.web3Provider);
  }

  async initAccounts() {
    this.accounts = await this.web3.eth.getAccounts();
    if (!this.accounts.length && !this.readOnly) {
      throw new Error("No accounts found — please unlock MetaMask.");
    }
  }

  async initContractTruffle() {
    const PtoPJson = require("../../build/contracts/PtoP.json");
    const BatteryEnergyJson = require("../../build/contracts/BatteryEnergy.json");
    const BatteryInvestmentJson = require("../../build/contracts/BatteryInvestment.json");

    // Wrap contracts
    this.contracts.PtoP = { contract: contract(PtoPJson) };
    this.contracts.BatteryInvestment = { contract: contract(BatteryInvestmentJson) };
    this.contracts.BatteryEnergy = { contract: contract(BatteryEnergyJson) };

    // Set provider
    this.contracts.PtoP.contract.setProvider(this.web3Provider);
    this.contracts.BatteryInvestment.contract.setProvider(this.web3Provider);
    this.contracts.BatteryEnergy.contract.setProvider(this.web3Provider);

    // Get deployed PtoP
    this.contracts.PtoP.deployed = await this.contracts.PtoP.contract.deployed();
    this.contracts.PtoP.address = this.contracts.PtoP.deployed.address;

    // Get sub‑contract addresses from PtoP
    this.contracts.BatteryInvestment.address =
      await this.contracts.PtoP.deployed.batteryInvestmentAddress();
    this.contracts.BatteryEnergy.address =
      await this.contracts.PtoP.deployed.batteryEnergyAddress();

    // Get deployed instances
    this.contracts.BatteryInvestment.deployed =
      await this.contracts.BatteryInvestment.contract.at(this.contracts.BatteryInvestment.address);
    this.contracts.BatteryEnergy.deployed =
      await this.contracts.BatteryEnergy.contract.at(this.contracts.BatteryEnergy.address);
  }

  async invest(amount) {
    if (this.readOnly) throw new Error("Wallet required to invest");
    try {
      await this.contracts.BatteryInvestment.deployed.investMoney({
        from: this.accounts[0],
        value: this.web3.utils.toWei(amount, "ether"),
      });
    } catch (e) {
      console.log("error", e);
    }
  }

  async addBattery(battery) {
    if (this.readOnly) throw new Error("Wallet required to add a battery");
    try {
      await this.contracts.PtoP.deployed.addBattery(
        battery.capacity,
        battery.currentFilled,
        String(battery.cost),
        battery.serialNumber,
        battery.priceThreshold,
        battery.chargeRate,
        { from: this.accounts[0] }
      );
      return true;
    } catch (err) {
      console.log(err);
    }
  }

  async getBattery(index) {
    try {
      const {
        capacity,
        chargeRate,
        cost,
        currentFilled,
        dateAdded,
        isActive,
        mapIndex,
        priceThreshold,
        serialNumber,
      } = await this.contracts.PtoP.deployed.getBattery(index);

      return {
        capacity: capacity.toString(),
        currentFilled: currentFilled.toString(),
        cost: cost.toString(),
        serialNumber: serialNumber,
        priceThreshold: priceThreshold.toString(),
        chargeRate: chargeRate.toString(),
      };
    } catch (err) {
      console.log(err);
    }
  }

  async getBatteryInvestmentAddress() {
    try {
      const batteryInvestmentAddress =
        await this.contracts.PtoP.deployed.batteryInvestmentAddress();
      return batteryInvestmentAddress;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = web3Contracts;