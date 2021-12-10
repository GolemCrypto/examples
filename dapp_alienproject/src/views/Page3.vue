<template>
  <div class="about">
    <div class="container">
      <div id="nav" class="connect-nav">
        <a href="https://www.aliensecretsociety.com/">
          <img src="../assets/images/alien.svg" class="img-fluid float-start logo d-none d-sm-block" width="300" alt="img" style="margin-top:2rem">
        </a>
        <div class="d-none d-sm-block">
          <a target="_blank" href="https://discord.com/invite/aliensecretsociety"><img src="../assets/icons/icon-one.svg" class="img-fluid pl-3"  alt="img"> </a>
          <a target="_blank" href="https://instagram.com/aliensecretsociety?utm_medium=copy_link"><img src="../assets/icons/icon-two.svg" class="img-fluid pl-3"  alt="img"> </a>
          <a target="_blank" href="https://twitter.com/AlienSecretSoc"><img src="../assets/icons/icon-three.svg" class="img-fluid pl-3"   alt="img"> </a>
        </div>
        <button v-if="!walletConnected" class="btn-connect" style="margin-right: 12px;" @click="connectWallet('metamask')">
          <img src="../assets/icons/metamask.png" width="30" height="30">
          Connect
        </button>
        <button v-if="!walletConnected" class="btn-connect" @click="connectWallet('walletconnect')">
          <img src="../assets/icons/walletconnect.png" height="30"> Connect</button>
        <button v-if="walletConnected && userAddress" class="btn-connect">
          {{userAddress.substr(0, 4) + '..' + userAddress.substr(-2) }}
        </button>
      </div>
      <TopSection cssclass="P3" :walletConnected="walletConnected" :CI="CI" :promotionType="promotionType"/>
      <section class="s2">
        <div class="row">
          <div class="col-md-6">
            <div class="text-center">
              <div>
                <Slider :slides="carousels[0]" :settings="{
                  itemsToShow: 1,
                  autoplay: 2000,
                  transition: 2000,
                  wrapAround: true
                }"></Slider>
              </div>
              <div>
                <Slider :slides="carousels[1]" :settings="{
                  itemsToShow: 1,
                  autoplay: 2000,
                  transition: 2000,
                  wrapAround: true
                }"></Slider>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <JoinCommunity></JoinCommunity>
          </div>
        </div>
      </section>
      <section class="s3">
        <Faqs></Faqs>
      </section>
    </div>
  </div>
</template>
<script>
import TopSection from "../components/TopSection.vue"
import Faqs from "../components/Faqs.vue"
import JoinCommunity from "../components/JoinCommunity.vue"
import WalletProvider from '../utils/walletProvider.js';
import CI from '../utils/contractsInterface.js';

export default {
  name: 'Page',
  props: {
    msg: String
  },
  components:{
    TopSection,Faqs,JoinCommunity
  },
  mounted() {
    this.walletProvider = new WalletProvider();
  },
  methods: {
    async connectWallet(walletType) {
      if (walletType === "metamask") {
        this.walletConnected = await this.walletProvider.connectMetamask();
      }
      
      if (walletType === "walletconnect") {
        this.walletConnected = await this.walletProvider.connectWithWalletConnect();
      }

      if (!this.walletConnected) {
        alert("Ups.. wallet cannot connect.");
        return;
      }

      this.userAddress = await this.walletProvider.signer.getAddress();
      this.CI = new CI(this.walletProvider, this.walletProvider.signer);
      const saleEnabled = await this.CI.ASSProxy.saleEnabled();
      if (saleEnabled) {
        this.promotionType = "dutchAuction";
      } else {
        this.promotionType = "noPromotion";
      }
    },
  },
  data: () => {
    return {
      userAddress: null,
      CI: null,
      signer: null,
      walletProvider: null,
      walletConnected: false,
      promotionType: null, // "whitelist || dutchAuction || noPromotion"
      carousels: [
        // Carousel 0
        [
           {
             img_urls:  ["/slider/1.jpg", "/slider/9.png", "/slider/3.png"],
             content: 'Slide content.'
           },{
             img_urls:  ["/slider/7.png", "/slider/8.png", "/slider/2.png"],
             content: 'Slide content.'
           },{
             img_urls:  ["/slider/13.png", "/slider/14.png", "/slider/15.png"],
             content: 'Slide content.'
           }
        ],        
        // Carousel 1
        [
           {
             img_urls:  ["/slider/4.png", "/slider/5.png", "/slider/6.png"],
             content: 'Slide content.'
           },{
             img_urls:  ["/slider/20.png", "/slider/22.png", "/slider/19.png"],
             content: 'Slide content.'
           },{
             img_urls:  ["/slider/10.png", "/slider/11.png", "/slider/12.png"],
             content: 'Slide content.'
           }
        ],

      ]
    }
  }
}
</script>
<style scoped>
.img-fluid.pl-3{
  margin-right: 30px;
}
</style>