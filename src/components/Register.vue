<template>
  <div>
    <group title="新用户，请先填写自己的资料">
      <x-input title="学号" placeholder="必填" required></x-input>
      <x-input title="专业" placeholder="必填" required></x-input>
      <x-input title="姓名" placeholder="必填" required></x-input>
      <x-input title="电话" placeholder="必填" required></x-input>
      <divider>iOS Gradients(v2.7.4)</divider>
      <box gap="10px 10px">

      </box>
    </group>
  </div>
</template>

<script>
  import { Divider, Group, XInput } from 'vux'
  import Box from '../../node_modules/vux/src/components/box/index'

  export default {
    components: {
      Box,
      Divider,
      Group,
      XInput
    }
  }
</script>
