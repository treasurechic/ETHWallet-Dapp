const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherWallet", () => {
  const deployFixture = async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const EtherWallet = await ethers.getContractFactory("EtherWallet");
    const etherWallet = await EtherWallet.deploy();
    return { etherWallet, owner, otherAccount };
  };

  describe("Deployment", () => {
    it("Should deploy and set the owner to the deployer address", async () => {
      const { etherWallet, owner } = await loadFixture(deployFixture);
      expect(await etherWallet.owner()).to.equal(owner.address);
    });
  });

  describe("BalanceOf", () => {
    it("Should get the balance of the ether wallet address", async () => {
      const { etherWallet } = await loadFixture(deployFixture);

      const balance = await ethers.provider.getBalance(etherWallet.address);
      expect(balance.toString()).to.equal(ethers.utils.parseEther("0"));
    });
  });

  describe("Deposit", () => {
    it("Should deposit ether to the contract", async () => {
      const { etherWallet } = await loadFixture(deployFixture);
      const tx = await etherWallet.deposit({
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
      const balance = await ethers.provider.getBalance(etherWallet.address);
      expect(balance.toString()).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("Withdrawal", () => {
    it("Should throw error if user tries to withdraw zero ETH", async () => {
      const { etherWallet, owner } = await loadFixture(deployFixture);
      const tx = etherWallet
        .connect(owner)
        .withdraw(owner.address, ethers.utils.parseEther("0"));
      await expect(tx).to.be.revertedWith("Amount needs to be greater than 0");
    });

    it("Should revert transaction if called by someone other than the owner", async () => {
      const { etherWallet, otherAccount } = await loadFixture(deployFixture);
      const tx = etherWallet
        .connect(otherAccount)
        .withdraw(otherAccount.address, ethers.utils.parseEther("1"));
      await expect(tx).to.be.revertedWith("Only owner can withdraw the Ether");
    });

    it("Should withdraw ether from the contract with non-zero ETH", async () => {
      const { etherWallet, owner } = await loadFixture(deployFixture);
      const depositTxn = await etherWallet.deposit({
        value: ethers.utils.parseEther("1"),
      });
      await depositTxn.wait();
      const balance_1 = await ethers.provider.getBalance(etherWallet.address);
      expect(balance_1.toString()).to.equal(ethers.utils.parseEther("1"));

      const tx = await etherWallet
        .connect(owner)
        .withdraw(owner.address, ethers.utils.parseEther("1"));
      await tx.wait();
      const balance_2 = await ethers.provider.getBalance(etherWallet.address);
      expect(balance_2.toString()).to.equal(ethers.utils.parseEther("0"));
    });
  });
});
