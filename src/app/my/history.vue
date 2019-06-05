<template>
  <div id="money" :flex=1 direction="column">
    <div class="search-box">
      <span class="quick-time pointer" @click="changeTime(0)" :class="index==0?'active':''">今天</span>
      <span class="quick-time pointer" @click="changeTime(1)" :class="index==1?'active':''">7天</span>
      <span class="quick-time pointer" @click="changeTime(2)" :class="index==2?'active':''">30天</span>
      <label>
        <span>起始时间：</span>
        <span>
            <img src="../.././assets/imgs/my/calendar.png">
            <input class="select-time start" v-model="beginTime">
          </span>
        <span>
            <img src="../.././assets/imgs/my/calendar.png">
            <input class="select-time end" v-model="endTime">
          </span>
      </label>
      <u class="pointer" @click="confirmSearch">查询</u>
    </div>
    <div class="content-warp" v-loading="isLoad" :loading-type=2>
      <div class="content scroll-warp history-scroll-warp" v-show="historyList.length>0">
        <table border="0" cellpadding="10" cellspacing="0">
            <thead>
                <tr class="position-title">
                    <th class="position-title-item fix-title">序号</th>
                    <th class="position-title-item fix-title">合约代码</th>
                    <th class="position-title-item fix-title">交易盈亏</th>
                    <th class="position-title-item fix-title">交易手数</th>
                    <th class="position-title-item fix-title">价格</th>
                    <th class="position-title-item fix-title">交易手续费</th>
                    <th class="position-title-item fix-title">时间</th>
                </tr>
            </thead>
            <tbody id="list-body">
                <tr class="position-item"
                    v-for="(item,index) in historyList"
                    :key="index"
                >
                    <td>
                        {{index+1}}
                    </td><td>
                      <span>{{item.contractName}}</span>
                      <span>{{item.contractCode}}</span>
                    </td><td>
                      <span>￥{{(item.profits*item.rate/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                      <span>({{item.profits}}{{item.currency}})</span>
                    </td><td>
                        {{item.volume}}
                    </td><td>
                        {{item.tradePrice}}
                    </td><td>
                      <span>￥{{(item.fee*item.rate/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                      <span>({{item.fee}}{{item.currency}})</span>
                    </td><td>
                        {{item.date}}
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
      <div class="no-data" v-show="historyList.length==0">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getFormalDate} from '../../util/index'
  export default {
    name: "history",
    data() {
      return {
        index: -1,
        list: [],
        beginTime:'',
        endTime:'',
        pageNo: 1,
        pageSize: 20,
        historyList:[],
        isCanRequest:true,
        waitTime:1000,
        isLoad:true,
      }
    },
    computed:{
      ...mapState([
        'api',
        'userInfo',
        'rateList',
        'isLoginApp'
      ]),
      ...mapState('market',[
        'allSubsCommodity'
      ])
    },
    watch:{
      allSubsCommodity:function(){
        if(Object.keys(this.allSubsCommodity).length>0&&this.index == -1){
          this.changeTime(0);
        }
      }
    },
    activated(){
      if(Object.keys(this.allSubsCommodity).length>0){
        this.changeTime(0);
      }
    },
    mounted() {
      this.initDate();
      document.getElementsByClassName('scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
    },
    methods: {
      //监听滚动
      listenerScroll(e){
          var scrollTop = e.target.scrollTop;
          var scrollLeft = e.target.scrollLeft;
          var titleNode = document.getElementsByClassName('position-title-item');
          for(var i=0;i<titleNode.length;i++){
              if(scrollTop!=0){
                  titleNode[i].style.top = scrollTop+'px';
              }else{
                  titleNode[i].style.top = '0px';
              }
          }
      },
      //初始化日期
      initDate(){
        laydate.render({
          elem: ".start"
          , trigger: 'click'
          , showBottom: false
          , done: (value, date) => {
            this.beginTime = value;
          }
        });
        laydate.render({
          elem: ".end"
          , trigger: 'click'
          , showBottom: false
          , done: (value, date) => {
            this.endTime = value;
          }
        });
      },
      changeTime(index) {
        if(this.index == index){
          return
        }
        if(!this.isCanRequest){
          return;
        }
        this.index = index;
        var nowDate = new Date().getTime();
        if(index == 0){
          //今日
          this.beginTime = getFormalDate(nowDate,'yyyy-mm-dd')
          this.endTime = getFormalDate(nowDate,'yyyy-mm-dd')
        }else if(index == 1){
          //7天
          var newDate = nowDate-1000*60*60*24*7;
          this.beginTime = getFormalDate(newDate,'yyyy-mm-dd')
          this.endTime = getFormalDate(nowDate,'yyyy-mm-dd')
        }else if(index == 2){
          //30天
          var newDate = nowDate-1000*60*60*24*30;
          this.beginTime = getFormalDate(newDate,'yyyy-mm-dd')
          this.endTime = getFormalDate(nowDate,'yyyy-mm-dd')
        }
        this.search();
      },
      confirmSearch(){
        if(!this.isCanRequest){
          return;
        }
        this.index = -1;
        this.search();
      },
      //开始搜索
      search(){
        this.pageNo = 1;
        if(this.beginTime == ''){
          this.$toast({
            content:'请选择开始时间'
          })
        }else if(this.endTime == ''){
          this.$toast({
            content:'请选择结束时间'
          })
        }else{
          this.isLoad = true;
          this.isCanRequest = false;
          this.$http.post(this.api+'/transactionRecords',{
            beginTime:this.beginTime+' 00:00:00',
            endTime:this.endTime+' 23:59:59',
            pageNo:this.pageNo,
            pageSize:this.pageSize,
            urlType:'050'
          },{
            token:this.userInfo.token,
            secret:this.userInfo.secret,
          },6000).then((res)=>{
            this.isLoad = false;
            this.isCanRequest = true;
            if(res.success&&res.code == '010'){
              this.historyList = [];
              var list = res.data.list;
              for(var i=0,len=list.length;i<len;i++){
                list[i].rate = this.rateList[list[i].currency].exchangeRate;
                // for(var j=0,len2=this.allContract.length;j<len2;j++){
                //   if(list[i].contractCode == this.allContract[j].contractCode){
                //     break;
                //   }
                // }
                list[i].contractName = this.allSubsCommodity[list[i].contractCode].contractName;
              }
              this.historyList = this.historyList.concat(list);
            }else{

            }
          }).catch((err)=>{
            this.isLoad = false;
            this.isCanRequest = true;
            console.log(err);
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  #money {
    background-color: white;
    margin-bottom: 10px;
    width: 100%;
    .head {
      padding: 0 20px;
      height: 49px;
      border-bottom: 1px solid #f2f2f2;
      align-items: center;
      display: flex;
      background-color: white;
      color: #999999;
      justify-content: space-between;
      font-size: 14px;

      .total {
        font-size: 16px;
        color: #999999;

        span {
          color: #333333;
          font-size: 20px;
        }
      }
    }

    .search-box {
      height: 79px;
      width: 850px;
      border-bottom: 1px solid #f2f2f2;
      display: flex;
      align-items: center;
      padding: 0 20px;

      .quick-time {
        margin-right: 20px;

        &.active {
          color: #1873f2;
        }
      }

      label {
        display: flex;
        align-items: center;
        height: 40px;

        span {
          display: flex;
          padding-left: 20px;
          align-items: center;
          margin-left: 20px;
          background-color: #f2f3f4;

          &:nth-child(1) {
            background-color: white;
          }

          &:nth-child(2) {
            height: 40px;
            border-radius: 3px;
          }

          &:nth-child(3) {
            height: 40px;
            margin-left: 10px;
            border-radius: 3px;
          }

          input {
            height: 100%;
            width: 100px;
            color: #333333;
            font-size: 14px;
            display: flex;
            padding-left: 20px;
            align-items: center;
          }
        }
      }

      u {
        margin-left: 20px;
        color: #1873f2;
        font-size: 14px;
      }
    }
    .content-warp{
      height: calc(100% - 80px);
      overflow: hidden;
      position: relative;
    }
    .scroll-warp{
      height: 100%;
      overflow: auto;
    }
    .content {
      table{
          min-width: 100%;
          border-collapse: collapse;
          thead{
              .position-title{
                  .fix-title{
                      white-space: nowrap;
                      background: $mainLowColor !important;
                      position: relative !important;
                      text-align: left;
                      top: 0;
                      color:$lowTitleColor;
                      font-weight: 500;
                  }
              }
          }
          tbody{
              color: $normalLowFontColor;
          }
          tr{
              height: 30px;
              td{
                  padding-right: 30px;
                  white-space: nowrap;
                  text-align: left;
              }
              td:last-child{
                  padding-right: 10px;
              }
          }
          .position-item:nth-child(even){
              // border-top: solid 1px $lowBorderLineColor;
              background: $lowBorderLineColor;
          }
          // .position-item:hover{
          //     background:$quotaChooseBgColor;
          // }
          // .position-item-active{
          //     background:$quotaChooseBgColor;
          // }
      }
    }
  }
</style>
