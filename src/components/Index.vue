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
        sessionStorage.setItem('token', res.data.access_token)
        this.$router.push('/lab')
      }).catch((error) => {
        console.debug(error.response)
        if (error.response.status === 400) {
          this.$router.push({path: '/register', query: {username: this.openid}})
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
