import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ShitStaking", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const ShitToken = await hre.ethers.getContractFactory("ShitToken");
    const token = await ShitToken.deploy();

    const ShitStaking = await hre.ethers.getContractFactory("ShitStaking");
    const staking = await ShitStaking.deploy(await token.getAddress());

    // Fund staking contract with rewards
    const rewardPool = hre.ethers.parseEther("10000000");
    await token.connect(owner).approve(await staking.getAddress(), rewardPool);
    await staking.connect(owner).fundRewards(rewardPool);

    // Give user1 some tokens
    await token.connect(owner).mint(user1.address, hre.ethers.parseEther("10000"));
    await token.connect(user1).approve(await staking.getAddress(), hre.ethers.parseEther("10000"));

    return { token, staking, owner, user1, user2 };
  }

  describe("Staking", function () {
    it("should accept valid stake", async function () {
      const { staking, user1 } = await deployFixture();
      const amount = hre.ethers.parseEther("1000");
      await staking.connect(user1).stake(amount, 30);
      expect(await staking.totalStaked()).to.equal(amount);
    });

    it("should reject zero amount", async function () {
      const { staking, user1 } = await deployFixture();
      await expect(staking.connect(user1).stake(0, 30)).to.be.revertedWith("Amount must be > 0");
    });

    it("should reject invalid lock period", async function () {
      const { staking, user1 } = await deployFixture();
      await expect(staking.connect(user1).stake(hre.ethers.parseEther("100"), 15)).to.be.revertedWith("Invalid lock period");
    });

    it("should track user positions", async function () {
      const { staking, user1 } = await deployFixture();
      await staking.connect(user1).stake(hre.ethers.parseEther("500"), 7);
      await staking.connect(user1).stake(hre.ethers.parseEther("300"), 30);
      const positions = await staking.getUserPositions(user1.address);
      expect(positions.length).to.equal(2);
    });
  });

  describe("Unstaking", function () {
    it("should reject unstaking before lock period", async function () {
      const { staking, user1 } = await deployFixture();
      await staking.connect(user1).stake(hre.ethers.parseEther("1000"), 7);
      await expect(staking.connect(user1).unstake(0)).to.be.revertedWith("Lock period not ended");
    });

    it("should allow unstaking after lock period", async function () {
      const { staking, token, user1 } = await deployFixture();
      const amount = hre.ethers.parseEther("1000");
      await staking.connect(user1).stake(amount, 7);

      // Fast forward 8 days
      await time.increase(8 * 24 * 60 * 60);

      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balanceAfter = await token.balanceOf(user1.address);

      // Should get back principal + some rewards
      expect(balanceAfter).to.be.gt(balanceBefore + amount - hre.ethers.parseEther("1"));
    });

    it("should reject double unstaking", async function () {
      const { staking, user1 } = await deployFixture();
      await staking.connect(user1).stake(hre.ethers.parseEther("1000"), 7);
      await time.increase(8 * 24 * 60 * 60);
      await staking.connect(user1).unstake(0);
      await expect(staking.connect(user1).unstake(0)).to.be.revertedWith("Already unstaked");
    });
  });

  describe("Rewards", function () {
    it("should accrue rewards over time", async function () {
      const { staking, user1 } = await deployFixture();
      await staking.connect(user1).stake(hre.ethers.parseEther("1000"), 30);

      // Fast forward 15 days
      await time.increase(15 * 24 * 60 * 60);

      const [, , , rewards] = await staking.getPosition(0);
      expect(rewards).to.be.gt(0);
    });

    it("should allow claiming rewards", async function () {
      const { staking, token, user1 } = await deployFixture();
      await staking.connect(user1).stake(hre.ethers.parseEther("1000"), 30);

      await time.increase(10 * 24 * 60 * 60);

      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).claimRewards(0);
      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Admin", function () {
    it("should allow owner to set APY", async function () {
      const { staking, owner } = await deployFixture();
      await staking.connect(owner).setAPY(7, 5000); // 50%
      expect(await staking.getAPY(7)).to.equal(5000);
    });

    it("should reject non-owner setting APY", async function () {
      const { staking, user1 } = await deployFixture();
      await expect(staking.connect(user1).setAPY(7, 5000)).to.be.reverted;
    });
  });
});
