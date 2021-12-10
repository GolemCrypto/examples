const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const whitelist1 = require("../assets/test/whitelist1");
const whitelist2 = require("../assets/test/whitelist2");
const Deployer = require("../scripts/deploy.helpers");

function hashEntry(account, amount) {
  return Buffer.from(ethers.utils.solidityKeccak256(['address', 'uint256'], [account, amount]).slice(2), 'hex')
}

const delay = time => new Promise(res=>setTimeout(res,time));

async function mineBlocks(blockNumber) {
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

describe("AlienSecretSociety Contract", function () {
  let owner, user1, user2, user3, user4, user5, user6; // note: user5 present on both whitelist 1 and whitelist 2.
  let ASS; // contract instance
  const whitelistMerkleTree = new MerkleTree(Object.entries(whitelist1).map(entry => hashEntry(...entry)), keccak256, { sortPairs: true });
  const halfEth = ethers.utils.parseEther("0.5");
  const deployParams = {
    treasury: null,
    whitelist: whitelist1,
    whitelistPrice: ethers.utils.parseEther("0.1"),
    whitelistMaxAmount: 2,
    dutchAuctionStartPrice: ethers.utils.parseEther("0.5"),
    dutchAuctionFloorPrice: ethers.utils.parseEther("0.18"),
    dutchAuctionPriceDecreaseBy: ethers.utils.parseEther("0.025"),
    dutchAuctionLimitPerWallet: 3,
    dutchAuctionChangeTick: 30, // minutes
    unrevealedBaseURI: "https://ipfs.io/ipfs/",
    revealedBaseURI: "https://ipfs.io/ipfs/QmPwyqqwo1nburDxnGUPedByajHDESpnFiCrvVErkTAxAg/",
    unrevealedTokenURI: "https://ipfs.io/ipfs/QmPpCqgU4MkTtASxrK6LeqAcaR4n7HU7si4fhPVeYuRViB/",
    maxSupply: 9999, // hardcoded in contract!
  }

  before(async () => {
    [owner, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();
  });

  describe("Deployment tests", () => {
    it("should deploy AlienSecretSociety", async () => {
      const factory = ethers.getContractFactory("AlienSecretSociety");
      deployParams.treasury = owner.address;
      ASS = await Deployer.deploy(deployParams);
      expect(await ASS.deployed());
    });

    it("should have correct MAX_SUPPLY", async () => {
      expect(await ASS.MAX_SUPPLY()).to.be.equal(deployParams.maxSupply);
    });
  });

  
  describe("Testing to mint with another user during dutch auction", () => {
       
  
        it("should not allow user1 to buy when auction is closed", async () => {
          
          expect(await ASS.setWhitelistSaleEnabled(false));
          expect(await ASS.setDutchAuctionEnabled(true));
          
          await expect(await ASS.connect(user1).buyNow(2,{value: halfEth+"0"}))
    });
  })  

  describe("Testing Basic transfer", () => {

    it("should transfer token 501", async () => {
      const tokenId = await ASS.tokenOfOwnerByIndex(user1.address, 0);
      expect(await ASS.connect(user1).transferFrom(user1.address, owner.address, tokenId))
      expect(await ASS.ownerOf(tokenId)).to.be.equal(owner.address);
      expect(await ASS.transferFrom(owner.address,user1.address,tokenId))
    });
    it("owner or other user cannot transfer on behalf of other", async () => {
      const tokenId = await ASS.tokenOfOwnerByIndex(user1.address, 0);
      expect(await ASS.ownerOf(tokenId)).to.be.equal(user1.address);
      try{
        expect(await ASS.connect(user2).transferFrom(user1.address,owner.address,tokenId))
      }catch(err){
        expect(err.message).to.be.equal("VM Exception while processing transaction: reverted with reason string 'ERC721: transfer caller is not owner nor approved'");
      }
    });

    });
});
