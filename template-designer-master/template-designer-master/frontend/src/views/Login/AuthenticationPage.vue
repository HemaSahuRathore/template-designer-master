<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <div class="auth-form">
          <v-tabs
            v-model="tab"
            background-color="#42A5F5"
            centered
            dark
            icons-and-text
            class="rounded-card-tab"
          >
            <v-tabs-slider></v-tabs-slider>

            <v-tab href="#tab-1">
              Login
              <v-icon>mdi-login</v-icon>
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab" class="rounded-card tab-style">
            <v-tab-item :key="1" :value="'tab-1'" class="rounded-card">
              <v-card flat class="rounded-card" min-height="280px">
                <v-card-text>
                  <v-form
                    @submit="login"
                    ref="loginForm"
                    lazy-validation
                    v-model="loginValid"
                  >
                    <v-text-field
                      label="Email"
                      name="email"
                      type="email"
                      outlined
                      placeholder="Enter Email Address"
                      :rules="emailRules"
                      v-model="email"
                      required
                    >
                    </v-text-field>
                    <v-text-field
                      id="password"
                      label="Password"
                      name="password"
                      outlined
                      placeholder="Enter Password"
                      :rules="passwordLoginRules"
                      v-model="password"
                      required
                      min="6"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show1 ? 'text' : 'password'"
                      @click:append="show1 = !show1"
                    >
                    </v-text-field>
                    <v-spacer></v-spacer>
                    <div class="text-center">
                      <v-btn type="submit" class="button white--text">
                        Login
                      </v-btn>
                    </div>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-col>
    </v-row>
    <Layout
      @selectedCoverPageMode="selectedCoverPageMode"
      ref="coverPageLayout"
      v-show="false"
    />
  </v-container>
</template>

<script>
import request from "../../utils/request";
import { mapActions, mapGetters } from "vuex";

import Layout from "../../components/CoverPage/Layouts.vue";
export default {
  name: "AuthenticationPage",
  components: {
    Layout,
  },
  data() {
    return {
      show1: false,
      loginValid: false,
      signupValid: false,
      email: "",
      emailRules: [
        (val) => !!val || "E-mail is Required",
        (val) => /.+@.+\..+/.test(val) || "E-mail must be valid",
      ],
      password: "",
      passwordSignupRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 6) || "Password must have 6 characters",
        (v) => /(?=.*[A-Z])/.test(v) || "Must have one uppercase character",
        (v) => /([!@$%])/.test(v) || "Must have one special character [!@#$%]",
      ],
      passwordLoginRules: [(val) => !!val || "Password is Required"],
      name: "",
      nameRules: [(val) => !!val || "Name is Required"],
      tab: 1,
      error: false,
      errorMsg: "",
    };
  },
  methods: {
    selectedCoverPageMode() {
      const coverPageMode = localStorage.getItem("selectedCoverPageMode");
      if (coverPageMode == "View") this.openedPage = "View";
    },
    ...mapActions({
      setSnackbar: "snackbar/setSnackbar",
      setUser: "setUser",
    }),
    ...mapActions(["checkUserAccessForApplication"]),
    ...mapActions(["getProject", "getProjects"]),
    loginValidate() {
      this.$refs.loginForm.validate();
    },

    async onAuthSuccess(message) {
      this.openCoverPageApplication("Cover Page", "New", "Quality");

      this.setSnackbar({ message, color: "success" });
      this.setUser();
    },

    //eslint-disable-next-line
    async openCoverPageApplication(tabOption, tab, title) {
      await this.getProjects();

      if (this.allProjects.length != 0) {
        let projectId = this.allProjects[0].refId;
        localStorage.setItem("selectedCoverPageMode", tab);
        localStorage.setItem("templateType", "Cover Page");
        this.$refs.coverPageLayout.changeMode(tab);
        this.$router
          .push(`/project/cover-page/${projectId}/id/design`)
          .catch(() => {});
      }
    },
    onAuthError(errors) {
      if (errors) {
        this.errorMsg = errors[0].message;
        this.setSnackbar({ message: this.errorMsg, color: "error" });
      }
    },
    async login(e) {
      e.preventDefault();
      if (
        this.email.trim() === "" ||
        this.password.trim() === "" ||
        !this.loginValid
      ) {
        this.loginValidate();
      } else {
        const body = {
          email: this.email,
          password: this.password,
        };
        await request({
          url: "/user/signin",
          body,
          method: "post",
          onSuccess: () => this.onAuthSuccess("LoggedIn successfullly!"),
          onError: this.onAuthError,
        });
      }
    },
  },
  computed: {
    ...mapGetters(["allProjects"]),
    ...mapGetters({
      isDocReadOnly: "tree/isDocReadOnly",
    }),
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";
.button {
  background-color: $blue !important;
}
.auth-form {
  width: 400px !important;
  margin: auto;
  border: 1px solid rgb(188, 186, 186);
  border-radius: 10px;
  padding: 0;
}
.rounded-card {
  border-radius: 0px 0px 10px 10px;
}
.rounded-card-tab {
  width: 400px !important;
  border-radius: 10px 10px 0px 0px;
  padding: 0;
  margin-left: -1px;
  margin-top: -1px;
}
</style>
