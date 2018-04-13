<template>
</template>

<script>
  export default {
    data () {
      return {
        // note: changing this line won't causes changes
        // with hot-reload because the reloaded component
        // preserves its current state and we are modifying
        // its initial state.
        tokenUrl: this.$baseUrl + '/token',
        openid: this.getUrlKey('openid')
      }
    },
    created () {
      console.debug(this.openid)
      this.$axios.get(this.tokenUrl, {params: {username: this.openid}}).then((res) => {
        if (res.status === 200) {
          if (res.data.access_token) {
            sessionStorage.setItem('token', res.data.access_token)
            this.$router.push('/lab')
          } else {
            this.$router.push('/register')
          }
        } else {
          console.debug('登录失败：' + res.data.status)
        }
      })
    }
  }
</script>

<style>
  .vux-demo {
    text-align: center;
  }

  .logo {
    width: 100px;
    height: 100px
  }
</style>
