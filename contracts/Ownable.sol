pragma solidity ^0.5;

contract Ownable {
    address private owner;
    /*
    Emits a log when ownership changes, allowing external systems to track ownership transfers.
    */
    event transfered_ownership(
        address indexed pastowner,
        address indexed presentowner
    );

    /*
    Initializes the contract’s state upon deployment.
    Thats why address(0) because there was no previous owner
    */
    constructor() internal {
        owner = msg.sender;
        emit transfered_ownership(address(0), owner);
    }

    /*
    Allows anyone to check who owns the contract
    */
    function Owner() public view returns (address) {
        return owner;
    }

    modifier owneronly() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function renounce_ownership() public owneronly {
        emit transfered_ownership(owner, address(0));
        owner = address(0);
    }

    function transfer_ownership(address presentowner) public owneronly {
        _transfer_ownership(presentowner);
    }

    function _transfer_ownership(address presentowner) internal {
        require(presentowner != address(0));
        emit transfered_ownership(owner, presentowner);
        owner = presentowner;
    }
}
