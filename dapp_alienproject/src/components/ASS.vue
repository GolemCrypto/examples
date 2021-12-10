<script>
import WalletProvider from '../utils/walletProvider.js';
import CI from '../utils/contractsInterface.js';

export default {
  mounted() {
    this.walletProvider = new WalletProvider();
  },
  methods: {
    async connectWallet(walletType) {
      if (walletType === "metamask") {
        this.walletConnected = await this.walletProvider.connectMetamask();
      }
      if (walletType === "coinbase") {
        this.walletConnected = await this.walletProvider.connectWithCoinbase();
      }
      
      if (walletType === "walletconnect") {
        console.log("Here");
        this.walletConnected = await this.walletProvider.connectWithWalletConnect();
      }

      this.CI = new CI(this.walletProvider.signer);
      const isWhitelist = await this.CI.ASS.whitelistSaleEnabled();
      const isDutchAuction = await this.CI.ASS.dutchAuctionEnabled();
      if (isWhitelist && !isDutchAuction) {
        this.promotionType = "whitelist";
      } else if (!isWhitelist && isDutchAuction) {
        this.promotionType = "dutchAuction";
      } else {
        this.promotionType = "noPromotion";
      }

    },
  },
  data: () => {
    return {
      CI: null,
      signer: null,
      walletProvider: null,
      walletConnected: false,
      promotionType: null, // "whitelist || dutchAuction || noPromotion"
    }
  }
}
</script>

<template>
  <div v-if="!walletConnected">
    <button @click="connectWallet('metamask')">Connect Metamask</button>
    <button @click="connectWallet('coinbase')">Connect Coinbase</button>
    <button @click="connectWallet('walletconnect')">Connect WalletConnect</button>
  </div>

  <p>Promotion type {{promotionType}}</p>

  <Whitelist v-if="walletConnected && promotionType === 'whitelist'" :CI="CI"/>
  <DutchAuction v-if="walletConnected && promotionType === 'dutchAuction'" :CI="CI"/>
  <div v-if="promotionType === 'noPromotion'">
    <p>There's no promotion active.</p>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
