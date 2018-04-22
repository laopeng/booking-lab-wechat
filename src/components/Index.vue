<template>
  <div style="height: 200px;line-height: 200px">
    <p style="text-align:center;">
      <inline-loading></inline-loading>
    </p>
  </div>
</template>

<script>
  import {InlineLoading} from 'vux'

  export default {
    components: {
      InlineLoading
    },
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
      if (this.openid) {
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
  }
</script>

<style>

</style>
