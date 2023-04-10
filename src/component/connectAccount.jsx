import React, { useState, useEffect } from "react";
import metamask from "../assets/img/metamask.svg";
import waving from "../assets/img/waving.svg";
import { ethers } from "ethers";
import EtherWallet from "../artifacts/contracts/EtherWallet.sol/EtherWallet.json";

//Boostratp components
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export const ConnectAccount = () => {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Metamask handling
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  //Etherwallet smart contract handling
  const [scbalance, setscBalance] = useState(0);
  const [ethToDeposit, setethToDeposit] = useState(0);
  const [ethToUseForWithdrawal, setEthToUseForWithdrawal] = useState(0);
  const [ethAddrToUseForWithdrawal, setEthAddrToUseForWithdrawal] = useState(
    ethers.constants.AddressZero
  );

  const getEtherwalletBalnace = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        provider
      );
      let balance = await contract.balanceOf();
      balance = ethers.utils.formatEther(balance);
      setscBalance(balance);
      console.log("contract balance", balance);
    } catch (error) {
      console.error(
        "Error connecting to the ether wallet smart contract",
        error
      );
    }
  };

  useEffect(() => {
    //Get balance of the smart contract
    getEtherwalletBalnace();
  }, []);

  //Connect to metamask
  const connectToMetamask = async () => {
    console.log("Connecting to metamask");
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      let balance = await signer.getBalance();

      balance = ethers.utils.formatEther(balance);
      setAccount(account);
      setBalance(balance);
      setIsActive(true);
      setLoading(false);
    } catch (error) {
      console.error("Error connecting to metamask", error);
    }
  };

  const disConnectMetamask = async () => {
    console.log("Disconnecting from metamask");
    setAccount("");
    setBalance(0);
    setIsActive(false);
  };

  const depositToEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      );
      const transaction = await contract.deposit({
        value: ethers.utils.parseEther(ethToDeposit),
      });
      await transaction.wait();

      UpdateBalancesOnScreen(signer, contract);
    } catch (error) {
      console.error("Error depositing ETH to smart contract", error);
    }
  };

  // Withdraw ETH from the EtherWallet smart contract
  const withdrawFromEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      );
      const transaction = await contract.withdraw(
        ethAddrToUseForWithdrawal,
        ethers.utils.parseEther(ethToUseForWithdrawal)
      );
      await transaction.wait();
      setEthToUseForWithdrawal(0);
      setEthAddrToUseForWithdrawal(ethers.constants.AddressZero);

      UpdateBalancesOnScreen(signer, contract);
    } catch (error) {
      console.error("Error withdrawing ETH from smart contract", error);
    }
  };

  const UpdateBalancesOnScreen = async (signer, contract) => {
    //Get user balance
    let balance = await signer.getBalance();
    setBalance(ethers.utils.formatEther(balance));

    //Get smart contract balance
    let _balance = await contract.balanceOf();
    setscBalance(ethers.utils.formatEther(_balance));
  };

  return (
    <>
      {isActive ? (
        <>
          <Button variant="danger" onClick={disConnectMetamask}>
            Disconnect Metamask
            <img src={waving} alt="" width="40" height="40" className="ms-1" />
          </Button>
          <div className="mt-2 mb-2">Connected Account:{account}</div>
          <div className="mt-2 mb-2">Balance:{Number(balance).toFixed(1)}</div>
          <div className="text-start">
            <Form.Group className="mb-4" controlId="numberInEth">
              <Form.Control
                type="text"
                placeholder="Enter the amount in Eth"
                className="mb-3"
                value={ethToDeposit}
                onChange={({ target: { value } }) => setethToDeposit(value)}
              />
              <Button
                variant="primary"
                type="button"
                onClick={depositToEtherWalletContract}
              >
                Deposit to EtherWallet Smart Contract
              </Button>
            </Form.Group>

            <Form.Group className="mb-3" controlId="numberInEthWithdraw">
              <Form.Control
                type="text"
                value={ethToUseForWithdrawal}
                placeholder="Enter the amount in ETH"
                className="mb-3"
                onChange={(e) => setEthToUseForWithdrawal(e.target.value)}
              />
              <Form.Control
                type="text"
                value={ethAddrToUseForWithdrawal}
                placeholder="Enter the ETH address to withdraw to"
                className="mb-3"
                onChange={(e) => setEthAddrToUseForWithdrawal(e.target.value)}
              />
              <Button
                variant="primary"
                type="button"
                onClick={withdrawFromEtherWalletContract}
              >
                Withdraw from EtherWallet Smart Contract
              </Button>
            </Form.Group>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={connectToMetamask}
            disabled={loading}
          >
            <img
              src={metamask}
              alt=""
              width="40"
              height="40"
              className="me-1"
            />
            Connect to Metamask
          </Button>
        </>
      )}

      <div className="mt-2 mb-2">
        EtherWallet Smart Contract Address:{contractAddress}
      </div>
      <div className="mt-2 mb-2">
        EtherWallet Smart Contract Balance:{Number(scbalance).toFixed(1)}
      </div>
    </>
  );
};
