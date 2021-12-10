const whitelist1 = require("./assets/test/whitelist1.json");

module.exports.deployParams = {
  live: {
      whitelist: whitelist1,
      whitelistPrice: ethers.utils.parseEther("0.1"),
      whitelistMaxAmount: 2,
      dutchAuctionStartPrice: ethers.utils.parseEther("0.25"),
      dutchAuctionFloorPrice: ethers.utils.parseEther("0.15"),
      dutchAuctionPriceDecreaseBy: ethers.utils.parseEther("0.05"),
      dutchAuctionLimitPerWallet: 5,
      dutchAuctionChangeTick: 6 * 60, // minutes (6 hours).
      unrevealedBaseURI: "https://ipfs.io/ipfs/",
      revealedBaseURI: "https://ipfs.io/ipfs/QmPwyqqwo1nburDxnGUPedByajHDESpnFiCrvVErkTAxAg/",
      unrevealedTokenURI: "https://ipfs.io/ipfs/QmPpCqgU4MkTtASxrK6LeqAcaR4n7HU7si4fhPVeYuRViB/",
      maxSupply: 10500, // hardcoded in contract!
  }, 
  testnet: {
      whitelist: whitelist1,
      whitelistPrice: ethers.utils.parseEther("0.1"),
      whitelistMaxAmount: 10,
      dutchAuctionStartPrice: ethers.utils.parseEther("0.5"),
      dutchAuctionFloorPrice: ethers.utils.parseEther("0.18"),
      dutchAuctionPriceDecreaseBy: ethers.utils.parseEther("0.025"),
      dutchAuctionLimitPerWallet: 13,
      dutchAuctionChangeTick: 30, // minutes
      unrevealedBaseURI: "https://ipfs.io/ipfs/",
      revealedBaseURI: "https://ipfs.io/ipfs/QmPwyqqwo1nburDxnGUPedByajHDESpnFiCrvVErkTAxAg/",
      unrevealedTokenURI: "https://ipfs.io/ipfs/QmPpCqgU4MkTtASxrK6LeqAcaR4n7HU7si4fhPVeYuRViB/",
      maxSupply: 10500, // hardcoded in contract!
  }
}