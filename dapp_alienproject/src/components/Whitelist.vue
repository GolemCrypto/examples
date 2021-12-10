<script>
import {ethers} from 'ethers';
import whitelist from '../assets/whitelist.js';
import MerkleProof from '../utils/merkleProof.js';

export default {
  props: ['CI'],
  async mounted() { 
    const ci = this.$props.CI;
    this.userAddress = await ci.signer.getAddress();
    this.isPresetnOnWhitelist = this.isOnWhitelist();
    

    // if (this.isPresetnOnWhitelist) {
    await this.updateState();
    // }
  },

  methods: {
    isOnWhitelist() {
      for (const addr in whitelist) {
        if (ethers.utils.getAddress(addr) === ethers.utils.getAddress(this.userAddress)) {
          return true;
        }
      }
      return false;
    },
    changeAmount(direction) {
      const step = 1;
      let amount = this.desiredAmount;
      if (direction === "increment" && amount + step <= this.validClaimAmount) {
        amount = amount + step;
      } else if (direction == "decrement" && amount - step >= 1) {
        amount = amount - step
      }
      this.desiredAmount = amount;
    },
    async updateState() {
      const ci = this.$props.CI;
      this.unitPrice = await ci.ASS.whitelistPrice();
      this.balance = await ci.ASS.balanceOf(this.userAddress);
      this.maxAmount = await ci.ASS.whitelistMaxAmount();
      this.validClaimAmount = (this.maxAmount.sub(this.balance)).toNumber();
      this.desiredAmount = this.validClaimAmount;
      this.totalSupply = await ci.ASS.totalSupply();
      this.maxSupply = await ci.ASS.MAX_SUPPLY();
      let redeemedCount = await ci.ASS.redeemedCount();
      try {
        redeemedCount = redeemedCount.toNumber();
        if (redeemedCount === 3000) {
          this.whitelistLimitReached = true;
        }
      } catch (err) {console.log("failed to check the redeemCount")} 

      this.leftAmount = this.maxSupply.sub(this.totalSupply);
      
      this.amountOptions = [];
      for (var i = 1; i < this.validClaimAmount + 1; i++) {
        this.amountOptions.push({text: i, value: i});
      }
      this.amountOptions.reverse();
    },
    async redeem() {
      this.loading = true;
      this.transactionHash = null;
      const proof = MerkleProof.getValidProof(this.userAddress);
      if (!proof) {
        alert("Ups. Seems you're not on the whitelist.");
        return;
      }
      const tx = await this.$props.CI.ASS.redeem(this.desiredAmount, proof, this.unitPrice.mul(this.desiredAmount));
      if (tx) {
        const r = await tx.wait(); 
        this.transactionHash = r.transactionHash;
      }
      await this.updateState();
      this.loading = false;
    }
  },
  computed: {
    totalPrice() {
      if (this.unitPrice) {
        return ethers.utils.formatUnits(this.unitPrice.mul(this.desiredAmount), 18);
      }
      return "0";
    },
    renderedPrice() {
      if (typeof this.unitPrice === 'string')
        return this.unitPrice;
      return ethers.utils.formatUnits(this.unitPrice, 18);
    },
    canClaim() {
      return this.validClaimAmount !== 0;
    },
    disabledIncrement() {
      return !(this.desiredAmount + 1 <= this.validClaimAmount);
    },    
    disabledDecrement() {
      return !(this.desiredAmount - 1 >= 1);
    },
  },
  data: () => {
    return {
      loading: false,
      userAddress: null,
      unitPrice: "0.1",
      balance: null,
      maxAmount: null,
      validClaimAmount: null,
      desiredAmount: null,
      isPresetnOnWhitelist: false,
      totalSupply: "0",
      maxSupply: "9999",
      leftAmount: "0",
      amountOptions: [],
      transactionHash: null,
      whitelistLimitReached: false
    }
  }
}
</script>

<template>
  <div v-if="!whitelistLimitReached">
      <div class="row">
      <div class="col-md-auto">
        <p>pre sale</p>
        <div class="ethvalue border">{{renderedPrice}} ETH<span style="font-size: 24px; margin-top: 12px;">/ALIEN</span><span class="circle"></span></div>
      </div>
  <!--     <div class="col-md-7">
        <div class="p2-text pt-2"><span class="text-green">{{leftAmount}}/{{maxSupply}}</span><br> Aliens LEFT!</div>
      </div> -->
    </div>
    <div class="row" v-if="isPresetnOnWhitelist && canClaim">
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
        <button v-if="!loading" @click="redeem()" type="button" class="btn btn-success">Mint</button>
      </div>
    </div>

    <div v-if="!isPresetnOnWhitelist || !canClaim" class="row">
      <div class="col-md-12">
        <p v-if="!isPresetnOnWhitelist">You're not on the whitelist sorry.</p>
        <p v-if="!canClaim">You've minted the max amount. Congrats!</p>
      </div>
    </div>  
    <div v-if="transactionHash" class="row">
      <div class="col-md-12">
        <p>
          Congrats! You've successfully minted A$$. 
          <a target="_blank" :href="`https://etherscan.io/tx/${transactionHash}`">See transaction here.</a>
        </p>
      </div>
    </div>
  </div>
  <div v-if="whitelistLimitReached">
    <p>PRE-SALE SOLD OUT</p>
  </div>

</template>

<style scoped>
a {
  color: #42b983;
}
</style>
