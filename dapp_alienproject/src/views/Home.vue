<template>
  <div class="home">
    <div class="container">
      <section class="s1">
        <div class="row">
          <div class="col-md-5"><img src="../assets/images/mainthumb.png" class="img-fluid"></div>
          <div class="col-md-7">
            <h1>Alien $ecret<br> $ociety</h1>
            <div class="ethvalue">0.5 ETH</div>
            <div>Already <span class="text-green">5251/9999</span> have been minted!</div>
            <div class="cselect">
              <select class="custom-select mr-sm-2" id="inlineFormCustomSelect">
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <button type="button" class="btn btn-success">Mint</button>
            </div>
          </div>
        </div>
      </section>
      <section class="s2">
        <div class="row">
          <div class="col-md-6">
            <JoinCommunity></JoinCommunity>
          </div>
          <div class="col-md-6">
            <div class="text-center">
              <img src="../assets/images/alien.png" alt="img">
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import JoinCommunity from "../../src/components/JoinCommunity.vue"
export default {
  name: 'Home',
  components: {
    JoinCommunity
  }
}
</script>
<style scoped>
section.s1 .cselect select {
  width:230px;
}
</style>