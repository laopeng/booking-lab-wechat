<template>
  <div>
    <group title="新用户，请先填写自己的资料">
      <x-input title="学号" placeholder="必填" required v-model="number"></x-input>
      <selector title="专业" :options="subjects" v-model="subject"></selector>
      <x-input title="姓名" placeholder="必填" required v-model="name"></x-input>
      <x-input title="电话" placeholder="必填" required v-model="phone"></x-input>
      <divider>资料</divider>
      <box gap="10px 10px">
        <x-button type="primary" :show-loading="loading">下一步</x-button>
      </box>
    </group>
  </div>
</template>

<script>
  import {Box, Divider, Group, XInput, XButton, Selector} from 'vux'

  export default {
    components: {
      XButton,
      Box,
      Divider,
      Group,
      XInput,
      Selector
    },
    data () {
      return {
        loading: false,
        subjects: [
          '应用心理学',
          '市场营销',
          '保险学',
          '国际经济与贸易',
          '公共事业管理',
          '其他'
        ],
        number: null,
        subject: '应用心理学',
        name: null,
        phone: null
      }
    }
  }
</script>
