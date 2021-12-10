<template>
  <section class="s1">
    <div class="row">
      <div class="col-md-5">
        <img src="../assets/images/mainthumb.gif" class="img-fluid main-gif" alt="img">
      </div>
      <div class="col-md-7">
        <h1 class="p2margin">Alien $ecret<br> $ociety</h1>
<!--         <Whitelist v-if="promotionType === 'whitelist'" :CI="CI"/>
        <DutchAuction v-if="promotionType === 'dutchAuction'" :CI="CI"/>
        <p style="color:#25B190" v-if="promotionType === 'noPromotion'">
          Pre-Sale is OFF <br>
          Mint will open at 4:00 P.M EST
        </p> -->
        <p style="color:#25B190">Sold out</p>
        <!-- <p style="color:#25B190" v-if="!walletConnected">Please connect wallet first.</p> -->
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: ['msg','cssclass', 'CI', 'promotionType', 'walletConnected'],
  watch: { 
    msg: function (val){
      console.log(val);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
