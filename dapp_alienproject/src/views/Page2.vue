<template>
  <div class="about">
    <div class="container">
      <section class="s1">
        <TopSection msg="Hellow" cssclass="CNAME"></TopSection>
      </section>
      <section class="s2">
        <div class="row">
          <div class="col-md-6">
            <div class="text-center">
              <img src="../assets/images/image2.png" class="img-fluid" alt="img">
            </div>
          </div>
          <div class="col-md-6">
            <JoinCommunity></JoinCommunity>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import TopSection from "../components/TopSection.vue"
import JoinCommunity from "../components/JoinCommunity.vue"
export default {
  name: 'Page',

  components:{
    TopSection,JoinCommunity
  }
}
</script>