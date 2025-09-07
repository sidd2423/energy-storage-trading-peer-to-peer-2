import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import web3Contracts from "../api/web3Contracts";
import batteryInfo from "../api/batteries";
import BatteryCarousel from "./BatteryCarousel";
import styles from '../../styles/PtoPInstructions.module.css';

class PtoPInstructions extends Component {
  state = {
    value: 0.0,
    myAddress: "",
    myBalance: 0,
    totalInvestment: 0,
    remainingInvestment: 0,
    numBatteries: 0,
    batteryList: [],
    Web3Contracts: null,
  };

  timerID;

  componentDidMount = async () => {
    console.log("componentDidMount; init web3");

    const Web3Contracts = new web3Contracts();

    try {
      await Web3Contracts.init();
      this.setState(
        {
          Web3Contracts,
          myAddress: Web3Contracts.accounts[0] || "",
        },
        () => {
          // Start stats polling after contracts are ready
          this.updateStats();
          this.timerID = setInterval(() => this.tick(), 5000);
        }
      );
    } catch (err) {
      console.error("Failed to init Web3Contracts:", err);
    }
  };

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  async tick() {
    this.updateStats();
  }

  updateBatteryList = async () => {
    const { Web3Contracts, numBatteries } = this.state;
    if (
      Web3Contracts?.contracts?.PtoP &&
      typeof numBatteries === "number" &&
      numBatteries > 0
    ) {
      const batteryList = [];
      for (let ind = 0; ind < numBatteries; ind++) {
        try {
          batteryList.push(await Web3Contracts.getBattery(ind));
        } catch (err) {
          console.warn(`Failed to load battery ${ind}:`, err);
        }
      }
      this.setState({ batteryList });
    }
  };

  updateStats = async () => {
    console.log("updateStats");
    const { Web3Contracts } = this.state;

    // Guard: skip if contracts aren't ready
    if (
      !Web3Contracts?.contracts?.BatteryInvestment?.deployed ||
      !Web3Contracts?.contracts?.PtoP?.deployed
    ) {
      console.warn("Contracts not ready yet, skipping stats update");
      return;
    }

    try {
      let totalInvestment = await Web3Contracts.contracts.BatteryInvestment.deployed.totalInvestment();
      totalInvestment = Web3Contracts.web3.utils.fromWei(totalInvestment, "ether");

      let remainingInvestment = await Web3Contracts.contracts.BatteryInvestment.deployed.remainingInvestment();
      remainingInvestment = Web3Contracts.web3.utils.fromWei(remainingInvestment, "ether");

      let numBatteries = (await Web3Contracts.contracts.PtoP.deployed.numBatteries()).toNumber();

      let myBalance = await Web3Contracts.web3.eth.getBalance(this.state.myAddress);
      myBalance = Web3Contracts.web3.utils.fromWei(myBalance, "ether");

      this.setState(
        {
          totalInvestment,
          remainingInvestment,
          numBatteries,
          myBalance,
        },
        () => {
          this.updateBatteryList();
        }
      );
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  addBattery = async (batteryId) => {
    if (this.state.Web3Contracts?.web3) {
      await this.state.Web3Contracts.addBattery(batteryInfo[batteryId]);
      this.updateBatteryList();
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    if (!this.state.Web3Contracts) return;
    await this.state.Web3Contracts.invest(String(this.state.value));
    await this.updateStats();
  };

  handleChange = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    const {
      Web3Contracts,
      batteryList,
      myBalance,
      myAddress,
      totalInvestment,
      remainingInvestment,
      numBatteries,
    } = this.state;

    return (
      <Container className="vpp-container">
        <div className="vpp-info-card">
          <Row>
            <p>
              My Address: <span id="owner">{myAddress}</span>
            </p>
          </Row>
          <Row>
            <p>
              My Balance: <span>{myBalance} eth</span>
            </p>
          </Row>
        </div>

        <div className="vpp-info-card">
          <Row>
            <Col>
              <p>
                Peer to Peer Contract Address:{" "}
                <span id="PtoPContract">
                  {Web3Contracts?.contracts?.PtoP?.address || ""}
                </span>
              </p>
            </Col>
            <Col>
              <p>
                Battery Investment Contract Address:{" "}
                <span id="batteryInvestment">
                  {Web3Contracts?.contracts?.BatteryInvestment?.address || ""}
                </span>
              </p>
            </Col>
            <Col>
              <p>
                Battery Energy Contract Address:{" "}
                <span id="batteryEnergy">
                  {Web3Contracts?.contracts?.BatteryEnergy?.address || ""}
                </span>
              </p>
            </Col>
          </Row>
        </div>

        <hr />

        <Row className="stats-grid">
          <Col className="stat-card">
            <h5>Total Amount Invested:</h5>
            <h4>
              <span id="totalInvestment">{totalInvestment}</span> eth
            </h4>
          </Col>
          <Col className="stat-card">
            <h5>Remaining Amount Left:</h5>
            <h4>
              <span id="remainingInvestment">{remainingInvestment}</span> eth
            </h4>
          </Col>
          <Col className="stat-card">
            <h5>Number of Batteries:</h5>
            <h4>
              <span id="numBatteries">{numBatteries}</span>
            </h4>
          </Col>
        </Row>

        <Row>
          <h3 id="contractDeployed"></h3>
        </Row>

        <Row className="vpp-step">
          <h3>First Step:</h3>
          <p>
            Invest some eth into the joint investment fund (enough to purchase a battery).
          </p>
        </Row>

        <Row>
          <div className="invest-form">
            <button
              className="btn-invest"
              type="button"
              onClick={this.handleSubmit}
            >
              Invest
            </button>
            <input
              onChange={this.handleChange}
              className="investmentAmount"
              placeholder="[Eth]"
              value={this.state.value}
            ></input>
          </div>
        </Row>

        <Row>
          <BatteryCarousel
            classType={"carousel-active"}
            batteries={batteryList}
            Web3Contracts={Web3Contracts}
          />
        </Row>

        <Row className="vpp-step">
          <h3>Step 2:</h3>
          <p>
            Add one or more batteries to the battery array.(Click "Add Battery")
          </p>
        </Row>

        <Row>
          <BatteryCarousel
            batteries={batteryInfo}
            classType={"carousel"}
            Web3Contracts={Web3Contracts}
            addBattery={this.addBattery}
          />
        </Row>
      </Container>
    );
  }
}

export default PtoPInstructions;