import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { useAuthStore } from "./stores/auth";
import "./styles/admin.css";

const app = createApp(App);
const pinia = createPinia();

useAuthStore(pinia).restoreSession();

app.use(pinia).use(router).mount("#app");
