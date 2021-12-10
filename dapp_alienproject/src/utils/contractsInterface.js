import { ethers } from "ethers";
import ASSAbi from "../assets/abis/AlienSecretSociety.js";
import ASSProxyAbi from "../assets/abis/AlienSecretSocietyProxy.js";
import constants from "../constants.js";
export default 
class CI { 
  constructor(walletProvider, signer) {
    this.walletProvider = walletProvider;
    this.signer = signer;
    console.log("signer", this.signer);
    this.ASSContract = new ethers.Contract(constants.addresses.ASS, ASSAbi, this.signer);
    this.ASSProxyContract = new ethers.Contract(constants.addresses.ASSProxy, ASSProxyAbi, this.signer);

    this.ASSProxy = {
      proxyDutchAuctionPurchased: (address) => this.safeCall(this.ASSProxyContract, 'proxyDutchAuctionPurchased', address),
      buyNow: (amount, ethAmount) => this.safeCall(this.ASSProxyContract, 'buyNow', amount, {value: ethAmount}),
      price: () => this.safeCall(this.ASSProxyContract, 'price'),
      saleEnabled: () => this.safeCall(this.ASSProxyContract, 'saleEnabled'),
      totalPurchasedAmount: (address) => this.safeCall(this.ASSProxyContract, 'totalPurchasedAmount', address),
    }

    this.ASS = {
      // Dutch Auction
      dutchAuctionCurrentPrice: () => this.safeCall(this.ASSContract, 'dutchAuctionCurrentPrice'),
      dutchAuctionEnabled: () => this.safeCall(this.ASSContract, 'dutchAuctionEnabled'),
      dutchAuctionLimitPerWallet: () => this.safeCall(this.ASSContract, 'dutchAuctionLimitPerWallet'),
      dutchAuctionPurchased: (address) => this.safeCall(this.ASSContract, 'dutchAuctionPurchased', address),
      dutchAuctionStartPrice: () => this.safeCall(this.ASSContract, 'dutchAuctionStartPrice'),
      dutchAuctionStartTimestamp: () => this.safeCall(this.ASSContract, 'dutchAuctionStartTimestamp'),
      dutchAuctionChangeTick: () => this.safeCall(this.ASSContract, 'dutchAuctionChangeTick'),

      // Whitelist
      redeem: (amount, proof, ethAmount) => this.safeCall(this.ASSContract, 'redeem', amount, proof, {value: ethAmount}),
      whitelistSaleEnabled: () => this.safeCall(this.ASSContract, 'whitelistSaleEnabled'),
      whitelistMaxAmount: () => this.safeCall(this.ASSContract, 'whitelistMaxAmount'),
      whitelistPrice: () => this.safeCall(this.ASSContract, 'whitelistPrice'),
      whitelistRedeemed: (address) => this.safeCall(this.ASSContract, 'whitelistRedeemed', address),

      // Reveal
      revealed: () => this.safeCall(this.ASSContract, 'revealed'),
    
      // Tokens
      redeemedCount: () => this.safeCall(this.ASSContract, 'redeemedCount'),
      MAX_SUPPLY: () => this.safeCall(this.ASSContract, 'MAX_SUPPLY'),
      WL_SUPPLY: () => this.safeCall(this.ASSContract, 'WL_SUPPLY'),
      balanceOf: (address) => this.safeCall(this.ASSContract, 'balanceOf', address),
      tokenByIndex: (index) => this.safeCall(this.ASSContract, 'tokenByIndex', index),
      tokenOfOwnerByIndex: (owner, index) => this.safeCall(this.ASSContract, 'tokenOfOwnerByIndex', owner, index),
      tokenURI: (tokenId) => this.safeCall(this.ASSContract, 'tokenURI', tokenId),
      totalSupply: () => this.safeCall(this.ASSContract, 'totalSupply'),
    }
  }

  async safeCall(contract, method, ...args) {
    try {
      const network = await this.walletProvider.provider.getNetwork();
      if (network && network.chainId !== constants.requiredChain) {
        alert(`Seems you're connected to the wrong network.\n\nPlease change to chain id ${constants.requiredChain}, and refresh the page.`);
        this.walletProvider.requestChainSwitch(constants.requiredChain);
        location.reload();
        return null;
      }
      return await contract[method].call(contract, ...args);
    } catch(err) {
      if (err.code == 4001) {
        console.warn("User rejected transaction");
        return null;
      }
      alert(err.message);
      console.error(`Failed to call '${method}' on`, contract, `with args`, args, ":", err);
      return null;
    }
  }

}