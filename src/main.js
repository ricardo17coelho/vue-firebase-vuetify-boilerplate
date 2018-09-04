import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase, { onAuthenticationChanged } from "./firebase";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  data: {
    firebase
  },
  created() {
    onAuthenticationChanged().then(user => {
      if (user) {
        console.log("Auth changed found user", user);

        this.$store.commit("USER_UPDATE", { user });
        this.$router.push("/");
      } else {
        this.$router.push("/sign-in");
      }
      // this.$store.commit("setAppState", { type: "success" });
    });
  },
  render: h => h(App)
}).$mount("#app");
