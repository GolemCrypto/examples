<template>
  <carousel :items-to-show="settings.itemsToShow" 
            :autoplay="settings.autoplay" 
            :wrapAround="settings.wrapAround"
            :transition="settings.transition"
            :pauseAutoplayOnHover="true">
    
    <slide v-for="(slide, index) in slides" :key="slide">
          <!-- <span v-for='(item, key, index) in img_urls' :key='key'> -->
            <span v-for="subject in slide.img_urls" :key="subject">
            <img :src="subject">
            </span>
      <!-- </span> -->
    </slide>
  </carousel>
</template>

 
<script>
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
export default {
  props: ['settings', "slides"],
  components: {Carousel, Slide, Pagination, Navigation, }
}
</script>


<style scoped>
.carousel { margin-bottom:20px; }
.carousel__slide span { background:#141316; margin:0 3px; border-radius:8px; width:150px; padding:12px; }
.carousel__slide span img { margin:0 0 20px 0; width:100%; height:auto;  }
.carousel__pagination, .carousel__prev, .carousel__next { display:none!important; }
</style>