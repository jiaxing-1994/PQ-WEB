<template>
  <Contain id="system" direction="column">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <template v-if="bannerList.length > 0" v-for="(item,index) in bannerList">
          <img :key="index" class="swiper-slide" :src="`${webApi}${item.imgUrl}`">
        </template>
      </div>
    </div>
    <div class="title">
      <template v-for="(item,index) in tabs">
        <span @click="changeType(index)" :class="typeIndex == index ?'active':''" :key="index">{{item.typeName}}</span>
      </template>
    </div>
    <Contain class="list" direction="column">
      <div class="wrapper">
        <template v-if="tabs.length > 0">
          <div class="item" :key="index" v-for="(item,index) in tabs[typeIndex].noticeList">
            <div @click="showDetail(index)" :class="selectedIndex == index?'selected':''" class="item-title">
              <span>{{item.title}}</span>
              <span><span v-show="selectedIndex!=index">{{item.noticeTime}}</span><img
                :src="selectedIndex==index ?require('../../assets/imgs/discover/arrow_down.png'):require('../../assets/imgs/discover/arrow_up.png')"></span>
            </div>
            <div v-show="selectedIndex == index" class="item-content">
              <span>{{item.title}}</span>
              <p v-html="item.content"></p>
              <span>{{item.noticeTime}}</span>
            </div>
          </div>
        </template>
      </div>
    </Contain>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {getFormalDate} from "../../util";
  import {mapState} from 'vuex';

  export default {
    name: "system",
    components: {Contain},
    data() {
      return {
        bannerList: [],
        tabs: [],
        typeIndex: 0,
        selectedIndex: 0,
        pageSize: 10,
        pagesIndex: [1],
        typeCode: "",
        noMore: [],
        isCanChange: true
      }
    },
    computed: {
      ...mapState(['api', 'webApi'])
    },
    activated() {
      if (this.api != "")
        this.getData();
      console.log(this.$route.query.index)
      if (this.$route.query.index) {
        this.selectedIndex = this.$route.query.index;
      }
    },
    watch: {
      api() {
        this.getData();
      }
    },
    methods: {
      getData() {
        this.$utils.banner({type: "010"}, res => {
          this.bannerList = res;
          this.$nextTick(() => {
            new Swiper('.swiper-container', {
              loop: true,
              speed: 1000,
              autoplay: {
                delay: 2000
              }
            });
          });
        });
        this.getNotice();
      },
      getNotice() {
        let data = {
          pageNo: this.pagesIndex[this.typeIndex],
          pageSize: this.pageSize
        };
        if (this.typeCode != "")
          data.typeCode = this.typeCode;
        this.$utils.noticeList(data, res => {
          //判断公告页数
          if (res[0].noticeList.length < this.pageSize)
            this.noMore[this.typeIndex] = true;
          res.forEach((item, index) => {
            //第一次请求全部类型，然后初始化除系统公告的所有类型page,noMore
            if (this.tabs.length == 0 && index != 0) {
              this.pagesIndex[index] = 1;
              this.noMore[index] = false;
            }
            //如果有数据，则转换时间
            if (item.noticeList)
              item.noticeList.forEach(k => {
                k.noticeTime = getFormalDate(k.noticeTime, "yyyy/mm/dd");
              });
          });
          //如果没有则全部赋值
          //有，则赋值选中的公告
          if (this.tabs.length == 0)
            this.tabs = res;
          else {
            //Vue中无法进行数据深度赋值，只能使用set
            if (this.tabs[this.typeIndex].noticeList) {
              let obj = this.tabs[this.typeIndex];
              obj.noticeList = obj.noticeList.concat(res[0].noticeList);
              this.$set(this.tabs, this.typeIndex, obj);
            } else {
              this.$set(this.tabs, this.typeIndex, res[0]);
            }
          }
        });
      },
      showDetail(index) {
        if (index == this.selectedIndex)
          this.selectedIndex = -1;
        else
          this.selectedIndex = index;
      },
      changeType(index) {
        if (this.typeIndex == index)
          return;
        if (this.isCanChange) {
          this.isCanChange = false;
          const timer = setTimeout(() => {
            clearTimeout(timer);
            this.isCanChange = true;
          }, 500);
          this.typeIndex = index;
          this.typeCode = this.tabs[index].typeCode;
          if (!this.tabs[index].noticeList) {
            this.getNotice();
          } else if (this.tabs[index].noticeList && this.tabs[index].noticeList.length == 0)
            this.getNotice();
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
  ::-webkit-scrollbar {
    width: 4px;
    height: 8px;
    left: 0;
    position: absolute;
    background-color: $scrollBgColor;
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track {
    border-radius: 0;
    background-color: #fafafa;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #cccccc;
  }

  .swiper-container {
    height: 110px;
    overflow: hidden;
    width: 890px;

    img {
      height: 110px;
    }
  }

  #system {
    .title {
      height: 49px;
      display: inline-block;
      line-height: 49px;
      color: #333333;
      font-size: 16px;
      padding-left: 20px;
      text-align: left;
      background-color: white;
      position: relative;
      border-bottom: 1px solid #f2f2f2;

      span {
        margin-right: 20px;
        position: relative;
        display: inline-block;
        height: 50px;
        cursor: pointer;

        &.active:after {
          position: absolute;
          content: '';
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: #1873f2;
        }
      }

      /*&:before {*/
      /*  position: absolute;*/
      /*  content: '';*/
      /*  display: inline-block;*/
      /*  width: 4px;*/
      /*  height: 50px;*/
      /*  left: 0;*/
      /*  background-color: #1873f2;*/
      /*}*/
    }

    .list {
      position: relative;
      overflow-y: auto;

      .wrapper {
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
        position: absolute;
      }

      .item {
        background-color: white;
        padding: 10px;
        display: flex;
        text-align: left;
        flex-direction: column;

        .item-title {
          padding: 0 10px;
          cursor: pointer;

          &.selected {
            background-color: #f2f3f4;
          }

          > span {
            display: block;
            height: 50px;
            line-height: 50px;

            &:first-child {
              float: left;
              color: #666666;
              font-size: 14px;
            }

            &:last-child {
              float: right;

              span {
                color: #999999;
                font-size: 14px;
                margin-right: 10px;
              }

              img {
                position: relative;
                top: -2px;
              }
            }

            &:after {
              clear: both;
            }
          }
        }

        .item-content {
          padding: 0 10px;
          border-bottom: 1px solid #f2f2f2;

          span:first-child {
            color: #666666;
            font-size: 20px;
            display: block;
            margin: 20px 0;
            font-weight: bold;
          }

          p {
            text-align: left;
            color: #666666;
            font-size: 14px;
          }

          span:last-child {
            color: #666666;
            font-size: 14px;
            display: block;
            margin: 20px 0;
          }
        }
      }
    }
  }
</style>
