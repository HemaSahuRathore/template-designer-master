<template>
  <v-app>
    <v-app-bar app elevation="2" color="white" dark height="45">
      <v-spacer></v-spacer>
      <v-app-bar-title
        ><v-img
          alt="company Logo"
          class="shrink ecosystem"
          contain
          align-center
          center
          src="../../assets/images/ecosystem-blue.png"
          height="120"
          width="120"
          size="120"
      /></v-app-bar-title>

      <v-spacer></v-spacer>

      <v-img
        alt="company Logo"
        class="shrink ml-5"
        contain
        src="../../assets/images/COSYS-Logo.svg"
        height="50"
        width="70"
      />
    </v-app-bar>

    <v-main>
      <v-container class="py-0 fill-height" fluid>
        <v-row class="fill-height">
          <v-col>
            <transition name="fade">
              <slot />
            </transition>
          </v-col>
        </v-row>
        <Snackbar />
      </v-container>
      <v-footer flat padless fixed class="text-center" dense>
        <v-card flat tile width="100%" class="text-center">
          <p style="color: #42a5f5">
            A product of Collaboration Systems Pvt. Ltd., Copyright 2022
          </p>
        </v-card>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script>
import Snackbar from "../Common/Snackbar";
export default {
  components: {
    Snackbar
  }
};
</script>
<style>

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: #fdfdfd;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #afafaf;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #929292;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 4px #92929299;
  background-color: #ffffff;
}
::-webkit-scrollbar-track:hover {
  background-color: #d1d1d1;
}
</style>
<style lang="scss">
@import "../../assets/scss/colors.scss";
.button {
  background-color: $blue !important;
}
.popup-nav-header {
  background: $blue;
}
</style>