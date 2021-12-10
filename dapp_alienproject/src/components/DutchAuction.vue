<script>
import {ethers} from 'ethers';

function timeSince(seconds) {
    return {
        days: Math.floor(seconds / 60 / 60 / 24),
        hours: Math.floor(seconds / 60 / 60) % 24,
        minutes: Math.floor(seconds / 60) % 60,
        seconds: Math.floor(seconds) % 60
    };
}

export default {
  props: ['CI'],
  mounted() {
    this.updateState();
  },
  methods: {
    async updateState() {
      const ci = this.$props.CI;
      this.userAddress = await ci.signer.getAddress();
      this.currentPrice = await ci.ASSProxy.price();
      this.walletLimit = await ci.ASS.dutchAuctionLimitPerWallet();
      this.purchasedAmount = await ci.ASSProxy.totalPurchasedAmount(this.userAddress);
      this.allowedAmount = this.walletLimit.sub(this.purchasedAmount).toNumber();
      this.desiredAmount = this.allowedAmount;
      this.totalSupply = await ci.ASS.totalSupply();
      this.maxSupply = await ci.ASS.MAX_SUPPLY();
      this.amountOptions = [];
      for (var i = 1; i < this.allowedAmount + 1; i++) {
        this.amountOptions.push({text: i, value: i});
      }
      this.amountOptions.reverse();
    },

    async buyNow() {
      this.loading = true;
      this.transactionHash = null;
      const ci = this.$props.CI;
      const tx = await ci.ASSProxy.buyNow(this.desiredAmount, this.currentPrice.mul(this.desiredAmount));
      if (tx) {
        try {
          const r = await tx.wait();
          this.transactionHash = r.transactionHash;
        } catch (err) {
          alert("Ups. Your transaction failed.");
          console.error(err);
        }
      }
      this.updateState();
      this.loading = false;
    }
  },
  computed: {
    renderedPrice() {
      if (typeof this.currentPrice === 'string')
        return this.currentPrice;
      return ethers.utils.formatUnits(this.currentPrice, 18);
    },
  },
  data: () => {
    return {
      currentPrice: "0.15",
      purchasedAmount: null,
      allowedAmount: null,
      loading: false,
      amountOptions: [],
      desiredAmount: null,
      totalSupply: "0",
      maxSupply: "9999",
      transactionHash: null,
    }
  }
}
</script>

<template>
  <div class="row">
    <div class="col-md-auto">
      <p>public sale</p>
      <div class="ethvalue border">{{renderedPrice}} ETH<span style="font-size: 24px; margin-top: 12px;">/ALIEN</span><span class="circle"></span></div>
    </div>
    <div class="col-md-auto d-none d-sm-block">
      <div class="p2-text pt-2" style="margin-top: 48px;"><span class="text-green">{{totalSupply}}/{{maxSupply}}</span><br> Aliens MINTED!</div>
    </div>
  </div>
  <div class="row" v-if="allowedAmount && !loading">
    <div class="col-md-4">
      <div class="cselect">
        <select v-model="desiredAmount" class="custom-select mr-sm-2" id="inlineFormCustomSelect">
          <option v-for="option in amountOptions" v-bind:value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>
    <div class="col-md-4">
      <button @click="buyNow()" type="button" class="btn btn-success">Mint</button>
    </div>
  </div>

  <div v-if="allowedAmount === 0" class="row">
    <div class="col-md-12">
      <p>You've minted the max amount. Congrats!</p>
    </div>
  </div>  

  <div v-if="transactionHash" class="row">
    <div class="col-md-12">
      <p >
        Congrats! You've successfully minted A$$. 
        <a target="_blank" :href="`https://etherscan.io/tx/${transactionHash}`">See transaction here.</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
