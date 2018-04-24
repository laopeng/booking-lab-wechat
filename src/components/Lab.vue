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
                            :value="item3" :disabled="item3.status !== '可用'">{{item3.id.bookingTimeRang}}</checker-item>
            </checker>
            <br/>
          </span>
        </div>
      </swiper-item>
    </swiper>
  </div>
</template>

<script>
  import { Tab, TabItem, Swiper, SwiperItem, Divider, Checker, CheckerItem } from 'vux'
  let map = new Map()

  export default {
    components: {
      Tab,
      TabItem,
      Swiper,
      SwiperItem,
      Divider,
      Checker,
      CheckerItem
    },
    data () {
      return {
        labsUrl: this.$baseUrl + '/labs',
        labStatusUrl: this.$baseUrl + '/lab/status',
        labs: [],
        labStatus: [],
        demo2: '美食',
        index: 0,
        chooseLab: null
      }
    },
    created () {
      this.getLabs()
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
      onItemClick (index) {
        console.log('on item click:', index)
        this.getLabStatusMap(this.labs[index].name)
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
