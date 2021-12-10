import { createApp } from 'vue'
import { createWebHistory, createRouter } from "vue-router";
import App from './App.vue'
import Whitelist from './components/Whitelist.vue';
import Home from '../src/views/Home.vue'
import Slider from './components/Slider.vue';
import DutchAuction from './components/DutchAuction.vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import '../src/assets/css/style.css'
import BootstrapVue3 from 'bootstrap-vue-3'
const app = createApp(App);
// Force deploy
const routes = [{
    path: '/',
    name: 'Home',
    component: () =>
        import ('../src/views/Page3.vue')
}]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

app.use(BootstrapVue3)

app.component("Whitelist", Whitelist);
app.component("DutchAuction", DutchAuction);
app.component("Slider", Slider);
app.use(router).mount('#app');