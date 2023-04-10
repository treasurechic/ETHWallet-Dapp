// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract EtherWallet {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function deposit() public payable {}

    function withdraw(address payable receiver, uint amount) public {
        require(amount > 0, "Amount needs to be greater than 0");
        require(
            address(this).balance >= amount,
            "Insufficient balance in contract"
        );
        require(msg.sender == owner, "Only owner can withdraw the Ether");
        receiver.transfer(amount);
    }

    function balanceOf() public view returns (uint) {
        return address(this).balance;
    }
}
