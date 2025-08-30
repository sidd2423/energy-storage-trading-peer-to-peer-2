import React from "react";
import Carousel from "react-bootstrap/Carousel";
import Row from "react-bootstrap/Row";
import styles from "../../styles/BatteryCarousal.module.css";

class BatteryCarousel extends React.Component {
  handleAddBattery = async (event) => {
    if (this.props.addBattery) {
      this.props.addBattery(event);
    }
  };

  render() {
    const { Web3Contracts = {}, batteries = [], classType } = this.props;

    return (
      <React.Fragment>
        <Row className={styles[classType]}>
          <Carousel interval={null}>
            {batteries.length > 0 ? (
              batteries.map((battery, ind) => {
                let { serialNumber, cost, priceThreshold } = battery;

                if (Web3Contracts && Web3Contracts.web3) {
                  try {
                    serialNumber = Web3Contracts.web3.utils.toAscii(
                      battery.serialNumber
                    );
                  } catch {}
                  cost = Web3Contracts.web3.utils.fromWei(
                    String(battery.cost),
                    "ether"
                  );
                  priceThreshold = Web3Contracts.web3.utils.fromWei(
                    String(battery.priceThreshold),
                    "ether"
                  );
                }

                return (
                  <Carousel.Item key={ind}>
                    <img
                      className="d-block w-25"
                      src="project.png"
                      alt="Battery slide"
                    />
                    <Carousel.Caption>
                      <h4>{battery.name}</h4>
                      <p>Serial Number (string): {serialNumber}</p>
                      <p>Battery Capacity: {battery.capacity} MWh</p>
                      <p>Current Amount Filled: {battery.currentFilled} MWh</p>
                      <p>Battery Cost: {cost} eth</p>
                      <p>Price Threshold: {priceThreshold} eth/kWh</p>
                      <p>Charge Rate: {battery.chargeRate} MWh/hr</p>
                      {this.props.addBattery && (
                        <button
                          className="btn-add-battery"
                          type="button"
                          onClick={() => this.handleAddBattery(ind)}
                        >
                          Add Battery
                        </button>
                      )}
                    </Carousel.Caption>
                  </Carousel.Item>
                );
              })
            ) : (
              <React.Fragment></React.Fragment>
            )}
          </Carousel>
        </Row>
      </React.Fragment>
    );
  }
}

export default BatteryCarousel;