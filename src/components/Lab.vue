<template>
  <div>
    <tab :line-width=2 active-color='#fc378c ' v-model="index">
      <tab-item class="vux-center" :selected="currentLabName === item.name" v-for="(item, index) in labs" :key="index">
        {{item.name}}
      </tab-item>
    </tab>
    <swiper v-model="index" height="1200px" :show-dots="false">
      <swiper-item v-for="(item, index) in labs" :key="index">
        <form-preview v-if="currentLab" header-label="你的预约实验室" :header-value="currentLabName"
                      :body-items="listCurrentLabStatus" :footer-buttons="cancelCurrent"></form-preview>
        <p style="padding: 10px" v-if="labStatusLog">
          {{labStatusLog}}
        </p>
        <div v-for="(item2, index2) in labStatus" :key="index2">
          <span v-if="index2 % 3 === 0">
            <br/>
            <divider>{{item2.id.bookingDate}}</divider>
            <checker
              :value="chooseLab"
              default-item-class="item"
              disabled-item-class="item-disabled">
              <checker-item v-for="(item3, i) in labStatus.slice(index2, index2 + 3)" :key="i"
                            :value="item3" :disabled="item3.status !== '可用'"
                            @on-item-click="onCheckerItemClick">
                {{item3.id.bookingTimeRang + (item3.student === null ? "" : '(' + item3.student.name + ')')}}
              </checker-item>
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
          <cell-form-preview :list="listChooseLabStatus"></cell-form-preview>
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
    CellFormPreview,
    FormPreview
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
      CellFormPreview,
      FormPreview
    },
    data () {
      return {
        labsUrl: this.$baseUrl + '/labs',
        labStatusUrl: this.$baseUrl + '/lab/status',
        currentUrl: this.$baseUrl + '/lab/status/current',
        teachersUrl: this.$baseUrl + '/teachers',
        currentStudentUrl: this.$baseUrl + '/students/current',
        labStatusLogUrl: this.$baseUrl + '/labStatusLogs/current',
        labs: [],
        labStatus: [],
        chooseLab: null,
        teachers: [],
        teacher: null,
        index: 0,
        showTeacher: false,
        showConfirm: false,
        listChooseLabStatus: [],
        cellTitle: null,
        form: {
          id: null,
          teacher: {
            name: null
          }
        },
        currentStudent: null,
        currentLab: null,
        currentLabName: null,
        labStatusLog: null,
        listCurrentLabStatus: [],
        cancelCurrent: [{
          style: 'primary',
          text: '取消预约',
          onButtonClick: () => {
            this.$axios.get(this.currentUrl).then((res) => { // 取消预约前先检验是否通过审核
              if (res.data) {
                this.currentLab = res.data

                const _this = this
                this.$vux.confirm.show({
                  title: '取消预约',
                  content: '你已经预约了【' + this.currentLabName + '(' + this.currentLab.audit + ')】' + (this.currentLab.audit === '通过' ? ',并且已经通过了审核，取消在三天内不能再次预约' : '') + '，确定要取消吗？',
                  // 组件除show外的属性
                  onCancel () {
                    _this.getCurrent()// 刷新选课状态
                    _this.currentLab = null
                    _this.currentLabName = null
                  },
                  onConfirm () {
                    _this.$axios.delete(_this.currentUrl).then((res) => {
                      _this.getCurrentStudent()
                      _this.getLabs()
                      _this.currentLab = null
                      _this.currentLabName = null
                      _this.$vux.toast.text(res.data)
                    }).catch((error) => {
                      console.debug(error.response)
                    })
                  }
                })
              }
            })
          }
        }]
      }
    },
    created () {
      this.getCurrentStudent()
      this.getLabs()
      this.getTeachers()
    },
    watch: {
      index: function (val) {
        this.getLabStatusMap(this.labs[val].name)
      }
    },
    methods: {
      getCurrentStudent () {
        this.$axios.get(this.currentStudentUrl).then((res) => {
          this.currentStudent = res.data
        })
      },
      getLabs () {
        this.$axios.get(this.labsUrl).then((res) => {
          this.labs = res.data
          // 查询当前学生的选课
          this.getCurrent()
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      getLabStatusMap (name) {
        this.$axios.get(this.labStatusUrl, {params: {name: name, sort: 'idBookingDate,asc'}}).then((res) => {
          map.set(name, res.data)
          this.labStatus = res.data
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      getCurrent () {
        this.$axios.get(this.currentUrl).then((res) => {
          if (res.data) {
            this.currentLab = res.data
            this.currentLabName = res.data.id.lab.name
            this.listCurrentLabStatus = [
              {
                label: '日期',
                value: this.currentLab.id.bookingDate
              },
              {
                label: '时间段',
                value: this.currentLab.id.bookingTimeRang
              }, {
                label: '指导教师',
                value: this.currentLab.teacher.name
              }, {
                label: '审核状态',
                value: this.currentLab.audit
              }
            ]
            this.labStatusLog = null
            // 查询实验室状态
            this.getLabStatusMap(this.currentLabName)
          } else {
            // 查询实验室状态
            this.getLabStatusMap(this.labs[this.index].name)
            this.currentLab = null
            this.getCurrentLog()
          }
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      getCurrentLog () {
        this.$axios.get(this.labStatusLogUrl).then((res) => { // 查询审核日志
          this.labStatusLog = res.data.content
        })
      },
      getTeachers () {
        this.$axios.get(this.teachersUrl).then((res) => {
          this.teachers = res.data
        }).catch((error) => {
          console.debug(error.response)
        })
      },
      switchTabItem (index) {
        console.log('on item click:', index)
      },
      onCheckerItemClick (itemValue, itemDisabled) {
        if (!itemDisabled) {
          if (this.currentStudent.isDisable) {
            this.$vux.alert.show({
              title: '禁止预约',
              content: '因取消了通过审核的预约，你已被禁止在' + this.currentStudent.disableDateTime + '之前进行预约实验室！'
            })
            return
          }
          if (this.currentLab && this.currentLab.audit === '通过') {
            this.$vux.alert.show({
              title: '重新预约',
              content: '你预约的【' + this.currentLabName + '】实验室已经通过审核，不能重新预约其他实验室！'
            })
            return
          }
          if (this.currentLabName) {
            const _this = this
            this.$vux.confirm.show({
              title: '重新预约',
              content: '你已经预约了【' + this.currentLabName + '】，确定要取消并重新预约其他实验室？',
              // 组件除show外的属性
              onCancel () {
                _this.getLabs()// 刷新选课状态
              },
              onConfirm () {
                _this.showTeacher = true
                _this.chooseLab = itemValue
                console.log('onCheckerItemClick:', _this.chooseLab)
              }
            })
          } else {
            this.showTeacher = true
            this.chooseLab = itemValue
            console.log('onCheckerItemClick:', this.chooseLab)
          }
        }
      },
      cancelTeacher () {
        this.chooseLab = null
        this.teacher = null
        this.showTeacher = false
        this.getLabs()// 刷新选课状态
      },
      confirmTeacher () {
        if (!this.teacher) {
          this.$vux.toast.text('请选择指导教师！')
          return
        }
        this.showTeacher = false
        this.showConfirm = true
        this.cellTitle = this.chooseLab.id.lab.name
        this.listChooseLabStatus = [
          {
            label: '日期',
            value: this.chooseLab.id.bookingDate
          },
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
        this.form.id = this.chooseLab.id
        this.form.teacher.name = this.teacher
        console.debug(this.form)
        this.chooseLab = null
        this.teacher = null
        this.$axios.put(this.labStatusUrl, this.form).then((res) => {
          this.getLabs()// 刷新选课状态
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
    width: 29.5%;
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
