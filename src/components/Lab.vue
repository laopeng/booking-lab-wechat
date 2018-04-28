<template>
  <div>
    <tab :line-width=2 active-color='#fc378c ' v-model="index">
      <tab-item class="vux-center" :selected="demo2 === item.name" v-for="(item, index) in labs" :key="index"
                @on-item-click="onItemClick">
        {{item.name}}
      </tab-item>
    </tab>
    <swiper v-model="index" height="1200px" :show-dots="false">
      <swiper-item v-for="(item, index) in labs" :key="index">
        <div v-for="(item2, index2) in labStatus" :key="index2">
          <span v-if="index2 % 3 === 0">
            <br/>
            <divider>{{item2.id.bookingDate}}</divider>
            <checker
              v-model="chooseLab"
              default-item-class="item"
              selected-item-class="item-selected" disabled-item-class="item-disabled">
              <checker-item v-for="(item3, i) in labStatus.slice(index2, index2 + 3)" :key="i"
                            :value="item3" :disabled="item3.status !== '可用'"
                            @on-item-click="onCheckerItemClick">{{item3.id.bookingTimeRang}}</checker-item>
            </checker>
            <br/>
          </span>
        </div>
      </swiper-item>
    </swiper>
    <div v-transfer-dom>
      <popup v-model="showTeacher" height="580px" is-transparent :hide-on-blur="false">
        <div
          style="width: 95%;background-color:#fff;height:560px;margin:0 auto;border-radius:5px;">
          <group>
            <radio :options="teachers" v-model="teacher">
              <template slot-scope="props" slot="each-item"><!-- use scope="props" when vue < 2.5.0 -->
                <p>
                  {{ props.label }}
                </p>
              </template>
            </radio>
          </group>
          <div style="padding:20px 15px;">
            <x-button type="primary" @click.native="confirmTeacher">确定</x-button>
            <x-button @click.native="cancelTeacher">取消</x-button>
          </div>
        </div>
      </popup>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showConfirm" title="请确认以下信息" @on-cancel="cancelConfirm" @on-confirm="confirmData">
        <group>
          <cell :title="cellTitle + '实验室'"></cell>
          <cell-form-preview :list="listLabStatus"></cell-form-preview>
        </group>
      </confirm>
    </div>
  </div>
</template>

<script>
  import {
    TransferDom,
    Popup,
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    Divider,
    Checker,
    CheckerItem,
    Group,
    Cell,
    XButton,
    Radio,
    Confirm,
    CellFormPreview
  } from 'vux'
  let map = new Map()

  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Tab,
      TabItem,
      Swiper,
      SwiperItem,
      Divider,
      Checker,
      CheckerItem,
      Group,
      Cell,
      XButton,
      Radio,
      Confirm,
      CellFormPreview
    },
    data () {
      return {
        labsUrl: this.$baseUrl + '/labs',
        labStatusUrl: this.$baseUrl + '/lab/status',
        teachersUrl: this.$baseUrl + '/teachers',
        labs: [],
        labStatus: [],
        chooseLab: null,
        teachers: [],
        teacher: null,
        index: 0,
        showTeacher: false,
        showConfirm: false,
        listLabStatus: [],
        cellTitle: null,
        form: {
          labStatusId: null,
          teacherName: null
        },
        demo2: null
      }
    },
    created () {
      this.getLabs()
      this.getTeachers()
    },
    methods: {
      getLabs () {
        this.$axios.get(this.labsUrl).then((res) => {
          this.labs = res.data
          // 查询实验室状态
          this.getLabStatusMap(this.labs[0].name)
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      getLabStatusMap (name) {
        if (!map.has(name)) {
          this.$axios.get(this.labStatusUrl, {params: {name: name, sort: 'idBookingDate,asc'}}).then((res) => {
            map.set(name, res.data)
            this.labStatus = res.data
          }).catch((error) => {
            console.debug(error.response)
          })
        } else {
          this.labStatus = map.get(name)
        }
      },
      getTeachers () {
        this.$axios.get(this.teachersUrl).then((res) => {
          this.teachers = res.data
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      onItemClick (index) {
        console.log('on item click:', index)
        this.getLabStatusMap(this.labs[index].name)
      },
      onCheckerItemClick (itemValue, itemDisabled) {
        this.showTeacher = true
        this.chooseLab = itemValue
        console.log('onCheckerItemClick:', this.chooseLab)
      },
      cancelTeacher () {
        this.chooseLab = null
        this.teacher = null
        this.showTeacher = false
      },
      confirmTeacher () {
        if (!this.teacher) {
          this.$vux.toast.text('请选择指导教师！')
          return
        }
        this.showTeacher = false
        this.showConfirm = true
        this.cellTitle = this.chooseLab.id.lab.name
        this.listLabStatus = [
          {
            label: '时间段',
            value: this.chooseLab.id.bookingTimeRang
          }, {
            label: '指导教师',
            value: this.teacher
          }
        ]
      },
      cancelConfirm () {
        this.chooseLab = null
        this.teacher = null
      },
      confirmData () {
        this.form.labStatusId = this.chooseLab
        this.form.teacherName = this.teacher
        this.$axios.put(this.labStatusUrl, this.form).then((res) => {
          this.$vux.toast.text(res.data)
        }).catch((error) => {
          console.debug(error.response)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .tab-swiper {
    background-color: #fff;
    height: 100px;
  }

  .item {
    color: green;
    width: 30%;
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-radius: 6px;
    border: 1px solid #ccc;
    background-color: #fff;
    margin-left: 9px;
  }

  .item-selected {
    background: #ffffff url(../assets/active.png) no-repeat right bottom;
    border-color: #ff4a00;
  }

  .item-disabled {
    color: #999;
  }
</style>
