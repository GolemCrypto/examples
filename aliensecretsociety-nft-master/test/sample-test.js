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
    dutchAuctionChangeTick: 6 * 60, // minutes
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

    it("should have correct whitelistPrice", async () => {
      expect(await ASS.whitelistPrice()).to.be.equal(deployParams.whitelistPrice);
    });

    it("should have correct whitelist maxAmount", async () => {
      expect(await ASS.whitelistMaxAmount()).to.be.equal(deployParams.whitelistMaxAmount);
    });

    it("should have correct dutchAuctionStartPrice", async () => {
      expect(await ASS.dutchAuctionStartPrice()).to.be.equal(deployParams.dutchAuctionStartPrice);
    });

    it("should have correct dutchAuctionFloorPrice", async () => {
      expect(await ASS.dutchAuctionFloorPrice()).to.be.equal(deployParams.dutchAuctionFloorPrice);
    });

    it("should have correct dutchAuctionPriceDecreaseBy", async () => {
      expect(await ASS.dutchAuctionPriceDecreaseBy()).to.be.equal(deployParams.dutchAuctionPriceDecreaseBy);
    });

    it("should have correct dutchAuctionLimitPerWallet", async () => {
      expect(await ASS.dutchAuctionLimitPerWallet()).to.be.equal(deployParams.dutchAuctionLimitPerWallet);
    });

    it("should have correct dutchAuctionChangeTick", async () => {
      expect(await ASS.dutchAuctionChangeTick()).to.be.equal(deployParams.dutchAuctionChangeTick * 60);
    });

    it("should have whitelistSaleEnabled turned on", async () => {
      expect(await ASS.whitelistSaleEnabled()).to.be.equal(true);
    });

    it("should have revealed set to false", async () => {
      expect(await ASS.revealed()).to.be.equal(false);
    });    

    it("should have correct MAX_SUPPLY", async () => {
      expect(await ASS.MAX_SUPPLY()).to.be.equal(deployParams.maxSupply);
    });
  });

  describe("Testing safeMint is internally called only", () => {
    it("should throw errer when owner calling safeMint", async () => {
      try {
        await ASS.safeMint(owner.address);  
      } catch (err) {
        expect(err.message).to.be.equal("ASS.safeMint is not a function")
      }
      
    });
    
    it("should throw errer when user calling safeMint", async () => {
      try {
        await ASS.connect(user1).safeMint(user1.address);  
      } catch (err) {
        expect(err.message).to.be.equal("ASS.connect(...).safeMint is not a function")
      }
    });
  })

  describe("Testing permissions", () => {
    describe("Testing non owner reverts", () => {
      it("should revert if user calls pause and unpause.", async () => {
        await expect(ASS.connect(user2).pause())
          .to.be.revertedWith("Ownable: caller is not the owner");        
        await expect(ASS.connect(user2).unpause())
          .to.be.revertedWith("Ownable: caller is not the owner");
      });      

      it("should revert if user calls withdraw", async () => {
        await expect(ASS.connect(user2).withdraw())
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls withdraw", async () => {
        await expect(ASS.connect(user2).withdraw())
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls setWhitelist.", async () => {
        await expect(ASS.connect(user2).setWhitelist(whitelistMerkleTree.getHexRoot()))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls setWhitelistSaleEnabled.", async () => {
        await expect(ASS.connect(user2).setWhitelistSaleEnabled(false))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls setDutchAuctionEnabled.", async () => {
        await expect(ASS.connect(user2).setDutchAuctionEnabled(false))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls reveal.", async () => {
        await expect(ASS.connect(user2).reveal(deployParams.revealedBaseURI))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("should revert if user calls mintByOwner.", async () => {
        await expect(ASS.connect(user2).mintByOwner(user2.address, "2"))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });
    })
  });

  describe("Testing Whitelist Sale", () => {
    describe("Testing owner is able to change the whitelist", () => {
      it("should correctly set whitelist2", async() => {
        const tree = new MerkleTree(Object.entries(whitelist2).map(entry => hashEntry(...entry)), keccak256, { sortPairs: true });
        expect(await ASS.setWhitelist(tree.getHexRoot()));
        expect(await ASS.whitelist()).to.be.equal(tree.getHexRoot());
      });
      it("should correctly set back whitelist1", async() => {
        expect(await ASS.setWhitelist(whitelistMerkleTree.getHexRoot()));
        expect(await ASS.whitelist()).to.be.equal(whitelistMerkleTree.getHexRoot());
      });
    })

    describe("Testing case when non whitelist user tries to redeem", () => {
      it("should revert when user6 tryies to redeem on whitelist1", async () => {
        const invalidProof = whitelistMerkleTree.getHexProof(hashEntry(user6.address, 0), whitelistMerkleTree.getHexRoot());
        await expect(ASS.connect(user6).redeem(1, invalidProof, {value: deployParams.whitelistPrice}))
          .to.be.revertedWith("address not verified on the whitelist");
      });

      it("should not allow user6 to impersonate user1", async () => {
        const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
        await expect(ASS.connect(user6).redeem(1, proof, {value: deployParams.whitelistPrice}))
          .to.be.revertedWith("address not verified on the whitelist");
      });
    })

    describe("Testing cases for whitelists", async () => {
      describe("Testing whitelistSaleEnabled flag", () => {
        it("user 1 should fail to redeem when whitelistSaleEnabled is set to false", async () => {
          expect(await ASS.setWhitelistSaleEnabled(false));
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(1, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("whitelist sale has ended");
          expect(await ASS.setWhitelistSaleEnabled(true));
        });
      })

      describe("Testing whitelist max limit",  () => {
        it("should be able to set WL_SUPPLY to 1", async () => {
          expect(await ASS.setPresaleLimit("1"));
          expect(await ASS.WL_SUPPLY()).to.be.equal(1);
        });
        it("should revert when trying to go over WL_SUPPLY.", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(2, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("cannot mint tokens. will go over wlSupply limit");
          expect(await ASS.setPresaleLimit("3000"));
        });
      });


      describe("Testing correct amounts handling", () => {
        it("should revert when user1 tries to mint 0 tokens", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(0, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("need to mint at least one token");
        });

        it("should revert when user1 tries to mint more tokens than allowed", async() => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(deployParams.whitelistMaxAmount + 1, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("tokens minted will go over user limit");
        });

        it("should correctly handle whitelistRedeemed mapping", async () => {
          const initialRedeemed = await ASS.whitelistRedeemed(user2.address);
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user2.address, 0));
          expect(await ASS.connect(user2).redeem(1, proof, {value: deployParams.whitelistPrice}));
          expect((await ASS.whitelistRedeemed(user2.address)).toNumber())
            .to.be.equal(initialRedeemed.toNumber() + 1);
        });

        it("should allow user2 to redeem one more token", async () => {
          const initialRedeemed = await ASS.whitelistRedeemed(user2.address);
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user2.address, 0));
          expect(await ASS.connect(user2).redeem(1, proof, {value: deployParams.whitelistPrice}));
          expect((await ASS.whitelistRedeemed(user2.address)).toNumber())
            .to.be.equal(initialRedeemed.toNumber() + 1);
        }); 

        it("should revert when user2 tries to redeem one more token", async () => {
          const initialRedeemed = await ASS.whitelistRedeemed(user2.address);
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user2.address, 0));
          await expect(ASS.connect(user2).redeem(1, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("tokens minted will go over user limit");
          expect((await ASS.whitelistRedeemed(user2.address)).toNumber())
            .to.be.equal(initialRedeemed.toNumber());
        }); 

      });

      describe("Testing correct pricing require statements", () => {
        it("should revert when user1 does not send enough eth to mint 1 token", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(1, proof, {value: ethers.utils.parseEther("0.001")}))
          .to.be.revertedWith("not enough ETH sent");
          expect(await ASS.balanceOf(user1.address)).to.be.equal(0);
        });

        it("should revert when user1 does not send enough eth for multiple tokens", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          await expect(ASS.connect(user1).redeem(2, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("not enough ETH sent for requested amount of tokens");
          expect(await ASS.balanceOf(user1.address)).to.be.equal(0);
        });

        it("should allow user1 to mint 2 tokens at once", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user1.address, 0));
          expect(await ASS.connect(user1).redeem(2, proof, {value: deployParams.whitelistPrice.mul(2)}));
          expect(await ASS.balanceOf(user1.address)).to.be.equal(2);
          expect(await ASS.whitelistRedeemed(user1.address)).to.be.equal(deployParams.whitelistMaxAmount);
        });
      });

      describe("Testing special case when user5 is present on both whitelists.", () => {
        it("should be able to mint with the best price with merkleWhitelist1", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user5.address, 0));
          expect(await ASS.connect(user5).redeem(1, proof, {value: deployParams.whitelistPrice}));
          expect(await ASS.whitelistRedeemed(user5.address)).to.be.equal(1);
        });        

        it("should be able to mint with the best price with merkleWhitelist1", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user5.address, 0));
          expect(await ASS.connect(user5).redeem(1, proof, {value: deployParams.whitelistPrice}));
          expect(await ASS.whitelistRedeemed(user5.address)).to.be.equal(2);
        })

        it("should not be able to mint more than maxAmount for merkleWhitelist1", async () => {
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user5.address, 0));
          await expect(ASS.connect(user5).redeem(1, proof, {value: deployParams.whitelistPrice}))
            .to.be.revertedWith("tokens minted will go over user limit");
        });
      });

      describe("Testing that contract receives the whitelist ETH", async () => {
        it("should receive eth spent by user4", async () => {
          const initialBalance = await waffle.provider.getBalance(ASS.address);
          const expectedBalance = initialBalance.add(deployParams.whitelistPrice);
          const proof = whitelistMerkleTree.getHexProof(hashEntry(user4.address, 0));
          expect(await ASS.connect(user4).redeem(1, proof, {value: deployParams.whitelistPrice}));
          const balance = await waffle.provider.getBalance(ASS.address);
          expect(balance).to.be.deep.equal(expectedBalance);
        });
      });
    });
  });

  describe("Testing Dutch Auction Sale", () => {
    describe("Testing initial state and permission", () => {
      it("should not allow owner to turn on the dutch auction when whitelist is enabled", async () => {
        expect(await ASS.whitelistSaleEnabled()).to.be.equal(true);
        await expect(ASS.setDutchAuctionEnabled(true))
          .to.be.revertedWith("whitelist sale needs to be disabled first");
      });

      it("should not allow user1 to buy when auction is closed", async () => {
        await expect(ASS.connect(user1).buyNow(1,{value: halfEth}))
          .to.be.revertedWith("auction is closed");
      });

      it("should allow onwer to turn on the dutch auction when whitelist is disabled", async () => {
        expect(await ASS.setWhitelistSaleEnabled(false));
        expect(await ASS.whitelistSaleEnabled()).to.be.equal(false);
        expect(await ASS.setDutchAuctionEnabled(true));
        expect(await ASS.dutchAuctionEnabled()).to.be.equal(true);
      });
    });

    describe("Testing minting tokens via Dutch Auction", () => {
      it("should revert when user1 tries to buy with not enough eth", async () => {
        await expect(ASS.connect(user1).buyNow(1,{value: ethers.utils.parseEther("0.001")}))
          .to.be.revertedWith("not enough ETH sent");
      });

      it("should allow user1 to mint at startPrice", async () => {
        const initialBalance = await ASS.balanceOf(user1.address);
        expect(await ASS.connect(user1).buyNow(1,{value: deployParams.dutchAuctionStartPrice}));
        const balance = await ASS.balanceOf(user1.address);
        expect(initialBalance.add("1")).to.be.deep.equal(balance);
      });

      it("should revert when user2 tries to buy more tokens than wallet limit", async () => {
        const initialBalance = await ASS.balanceOf(user2.address);
        const expectedBalance = initialBalance.add(deployParams.dutchAuctionLimitPerWallet);
        for (var i = 0; i < deployParams.dutchAuctionLimitPerWallet; i++) {
          expect(await ASS.connect(user2).buyNow(1,{value: halfEth}));
        }
        const balance = await ASS.balanceOf(user2.address);
        expect(balance).to.be.deep.equal(expectedBalance);
        await expect(ASS.connect(user2).buyNow(1,{value: halfEth}))
          .to.be.revertedWith("wallet limit reached");
      });
    });

    describe("Testing Dutch Auction Pricing", () => {
      it("should return correct Dutch Auction current price == start price", async () => {
        expect(await ASS.dutchAuctionCurrentPrice()).to.be.equal(deployParams.dutchAuctionStartPrice);
      });

      it("should allow user1 to mint at decremented price", async () => {
        // Simulating two decrement ticks have passed. (e.g. 1 hour);
        hre.network.provider.send("evm_increaseTime", [deployParams.dutchAuctionChangeTick * 60 * 2]);
        await mineBlocks(1); 

        const startPrice = deployParams.dutchAuctionStartPrice;
        const decrement = deployParams.dutchAuctionPriceDecreaseBy;
        const price = await ASS.dutchAuctionCurrentPrice();
        const expectedPrice = startPrice.sub(decrement.mul(ethers.BigNumber.from("2")));
        expect(price).to.be.deep.equal(expectedPrice);
        
        const initialBalance = await ASS.balanceOf(user1.address);
        expect(await ASS.connect(user1).buyNow(1,{value: expectedPrice}));
        const balance = await ASS.balanceOf(user1.address);
        expect(initialBalance.add("1")).to.be.deep.equal(balance);
      });

      it("should correctly decrement price", async () => {
        const startPrice = await ASS.dutchAuctionCurrentPrice();
        const decrement = deployParams.dutchAuctionPriceDecreaseBy;
        const floorPrice = deployParams.dutchAuctionFloorPrice;
        const loops = 100;
        for (var i = 0; i < loops; i++) {
          if (i != 0) {
            hre.network.provider.send("evm_increaseTime", [deployParams.dutchAuctionChangeTick * 60]);
            await mineBlocks(1); 
          }
          const price = await ASS.dutchAuctionCurrentPrice();
          let expectedPrice = startPrice.sub(decrement.mul(ethers.BigNumber.from(i.toString())));
          if (expectedPrice.lt(floorPrice)) {
            expectedPrice = floorPrice;
          }
          console.log("expected price: ", ethers.utils.formatUnits(expectedPrice, 18), "actual price", ethers.utils.formatUnits(price, 18));
          await expect(price).to.be.deep.equal(expectedPrice);
        }      
      });

      it("should allow user1 to mint at floorPrice", async () => {
        const initialBalance = await ASS.balanceOf(user1.address);
        expect(await ASS.connect(user1).buyNow(1,{value: deployParams.dutchAuctionFloorPrice}));
        const balance = await ASS.balanceOf(user1.address);
        expect(initialBalance.add("1")).to.be.deep.equal(balance);
      })
    });

    describe("Testing that contract receives the dutch auction ETH", async () => {
      it("should receive eth spent by user4", async () => {
        const price = await ASS.dutchAuctionCurrentPrice();
        const initialBalance = await waffle.provider.getBalance(ASS.address);
        const expectedBalance = initialBalance.add(price);
        expect(await ASS.connect(user4).buyNow(1,{value: price}));
        const balance = await waffle.provider.getBalance(ASS.address);
        expect(balance).to.be.deep.equal(expectedBalance);
      });
    });
  });

  describe("Testing the reveal", () => {
    it("user1 should fail to reveal", async() => {
      await expect(ASS.connect(user2).reveal("hacky.com"))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("user1 should see his unrevealed tokenURI", async () => {
      const tokenId = await ASS.tokenOfOwnerByIndex(user1.address, 0);
      const uri = await ASS.tokenURI(tokenId);
      expect(deployParams.unrevealedTokenURI).to.be.equal(uri);
    });

    it("owner is able to reveal", async() => {
      expect(await ASS.reveal(deployParams.revealedBaseURI));
      expect(await ASS.revealed()).to.be.equal(true);
    });

    it("owner is able to reveal again", async() => {
       expect(await ASS.reveal(deployParams.revealedBaseURI));
    });

    it("user1 should see his revealed tokenURI", async () => {
      const tokenId = await ASS.tokenOfOwnerByIndex(user1.address, 0);
      const uri = await ASS.tokenURI(tokenId);
      const expectedUri = `${deployParams.revealedBaseURI}${tokenId}.json`;
      expect(expectedUri).to.be.equal(uri);
    });

    it("user2 should see correct revealedTokeURI on mint", async () => {
      const tokenId = await ASS.tokenOfOwnerByIndex(user2.address, 0);
      const uri = await ASS.tokenURI(tokenId);
      const expectedUri = `${deployParams.revealedBaseURI}${tokenId}.json`;
      expect(expectedUri).to.be.equal(uri);
    });
  });

  describe("Testing maxSupply.", () => {
    it("shouldn't revert reaching with buyNow after doing giveaways", async () => {
      await expect(ASS.buyNow(1,{value: halfEth}))
    });

    it("owner is able to mintByOwner till maxSupply is reached", async() => {
      const initialBalance = await ASS.balanceOf(owner.address);
      const maxSupply = ethers.BigNumber.from(deployParams.maxSupply.toString());
      const amount = maxSupply.sub(await ASS.totalSupply());
      const batchSize = 150;
      const batches = amount.div(batchSize).add(1);
      console.log("batches", batches.toString());
      try{
        for (var i = 0; i < batches; i++) {
          console.log("Minted", batchSize * i, "of", amount.toNumber());
          const supply = await ASS.totalSupply();
          if (supply.add(batchSize.toString()).gte(maxSupply)) {
            const remains = maxSupply.sub(await ASS.totalSupply());
            await ASS.mintByOwner(owner.address, remains);
          } else {
            await ASS.mintByOwner(owner.address, batchSize); 
          }
        }
      }catch(err)
      {
        expect(err.message).to.be.equal("VM Exception while processing transaction: reverted with reason string 'cannot mint tokens. will go over giveawaySupply limit'")
      }
      expect(await ASS.totalSupply()).to.be.deep.equal(deployParams.maxSupply);
    });

    it("should revert reaching as whitelist not open", async () => {
      const proof = whitelistMerkleTree.getHexProof(hashEntry(user3.address, 0));
      await expect(ASS.connect(user3).redeem(1, proof, {value: deployParams.whitelistPrice}))
        .to.be.revertedWith("whitelist sale has ended");
    });
  });

  describe("Owner is able to withdraw eth", () => {
    it("should take all eth from the contract", async () => {
        const initialAssBalance = await waffle.provider.getBalance(ASS.address);
        const initialBalance = await waffle.provider.getBalance(owner.address);
        const expectedBalance = initialBalance.add(initialAssBalance);
        expect(await ASS.withdraw());
        const assBalance = await waffle.provider.getBalance(ASS.address);
        const balance = await waffle.provider.getBalance(owner.address);
        expect(assBalance).to.be.equal(0);
        expect(balance.gt(initialBalance)).to.be.equal(true);
    });
  });
});
