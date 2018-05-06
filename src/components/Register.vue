<template>
  <div>
    <group title="新用户，请先填写自己的资料">
      <x-input title="学号" placeholder="必填" required v-model="form.number"></x-input>
      <selector title="专业" :options="subjects" v-model="form.subject"></selector>
      <x-input title="姓名" placeholder="必填" required v-model="form.name"></x-input>
      <x-input title="电话" placeholder="必填" required v-model="form.phone" is-type="china-mobile"></x-input>
      <divider>资料</divider>
      <box gap="10px 10px">
        <x-button type="primary" :show-loading="loading" @click.native="addStudent">下一步</x-button>
      </box>
    </group>
  </div>
</template>

<script>
  import {Box, Divider, Group, XInput, XButton, Selector, Toast} from 'vux'

  export default {
    components: {
      XButton,
      Box,
      Divider,
      Group,
      XInput,
      Selector,
      Toast
    },
    data () {
      return {
        addUrl: this.$baseUrl + '/students',
        loading: false,
        subjects: [
          '应用心理学',
          '市场营销',
          '保险学',
          '国际经济与贸易',
          '公共事业管理',
          '其他'
        ],
        form: {
          number: null,
          subject: '应用心理学',
          name: null,
          phone: null,
          user: {
            username: this.$route.query.username
          }
        }
      }
    },
    methods: {
      addStudent () {
        this.$axios.post(this.addUrl, this.form).then((res) => {
          this.$vux.toast.text('资料绑定微信成功，开始使用。')
          sessionStorage.setItem('token', null)
          this.$router.push('/lab')
        }).catch((error) => {
          console.debug(error.response)
          if (error.response.status === 400) {
            this.$vux.toast.text('资料请填写完整和正确')
          }
        })
      }
    }
  }
</script>
