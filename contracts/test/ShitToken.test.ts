import { expect } from "chai";
import hre from "hardhat";

describe("ShitToken", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();
    const ShitToken = await hre.ethers.getContractFactory("ShitToken");
    const token = await ShitToken.deploy();
    return { token, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      const { token } = await deployFixture();
      expect(await token.name()).to.equal("SHIT");
      expect(await token.symbol()).to.equal("$SHIT");
    });

    it("should mint initial supply to deployer", async function () {
      const { token, owner } = await deployFixture();
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(hre.ethers.parseEther("100000000"));
    });

    it("should set deployer as owner", async function () {
      const { token, owner } = await deployFixture();
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint", async function () {
      const { token, owner, user1 } = await deployFixture();
      await token.connect(owner).mint(user1.address, hre.ethers.parseEther("1000"));
      expect(await token.balanceOf(user1.address)).to.equal(hre.ethers.parseEther("1000"));
    });

    it("should reject minting from non-owner", async function () {
      const { token, user1, user2 } = await deployFixture();
      await expect(token.connect(user1).mint(user2.address, hre.ethers.parseEther("1000"))).to.be.reverted;
    });

    it("should reject minting over max supply", async function () {
      const { token, owner, user1 } = await deployFixture();
      const maxSupply = await token.MAX_SUPPLY();
      await expect(token.connect(owner).mint(user1.address, maxSupply)).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    it("should allow holders to burn", async function () {
      const { token, owner } = await deployFixture();
      const burnAmount = hre.ethers.parseEther("100");
      await token.connect(owner).burn(burnAmount);
      const expected = hre.ethers.parseEther("100000000") - burnAmount;
      expect(await token.balanceOf(owner.address)).to.equal(expected);
    });
  });
});
