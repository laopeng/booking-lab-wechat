<template>
  <div style="height: 200px;line-height: 200px">
    <p style="text-align:center;">
      <inline-loading></inline-loading>
    </p>
  </div>
</template>

<script>
import { InlineLoading } from "vux";

export default {
  components: {
    InlineLoading
  },
  data() {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      wxUserTokenUrl: this.$baseUrl + "/wechat/user/token",
      tokenUrl: this.$baseUrl + "/token",
      openid: this.getUrlKey("openid"),
      code: this.getUrlKey("code")
    };
  },
  created() {
    if (sessionStorage.getItem("token")) {
      this.$router.push("/lab");
    } else if (this.openid) {
      this.getToken();
    } else if (this.code) {
      //通过微信code获取微信网页授权的openId
      console.debug(this.code);
      this.$axios
        .get(this.wxUserTokenUrl, { params: { code: this.code } })
        .then(res => {
          this.openid = res.data.openid;
          this.getToken();
        });
    } else {
      //获取微信code
      window.location.href = this.$wxUrl;
    }
  },
  methods: {
    getToken() {
      //根据openId获取本系统的accessToken
      console.debug(this.openid);
      sessionStorage.setItem("openid", this.openid);
      this.$axios
        .get(this.tokenUrl, { params: { username: this.openid } })
        .then(res => {
          //有用户信息跳转到选择实验室界面
          sessionStorage.setItem("token", res.data.access_token);
          this.$router.push("/lab");
        })
        .catch(error => {
          console.debug(error.response);
          if (error.response.status === 400) {
            //无用户信息跳转到注册页面
            this.$router.push({
              path: "/register",
              query: { username: this.openid }
            });
          }
        });
    }
  }
};
</script>

<style>
</style>
