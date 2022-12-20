<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-18 14:24:20
 * @LastEditTime: 2022-03-01 15:21:09
 * @Description: 任务栏-定时任务
-->
<template>
  <div class="app-box no-user-select">
    <div class="message-box">
      <div class="left">
        <svg-icon icon-class="alarmClock"></svg-icon>
        <span>每周任务</span>
      </div>
      <div class="right">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <el-icon class="el-icon-more">
              <More />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="clearfix">
                添加 <i class="el-icon-plus"></i>
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                编辑
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                取消
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <ul class="applet-box">
      <li v-for="(item, index) in formData.taskData" :class="{ 'transform': item.dd === formData.currentTime }"
        :title="item.date">
        <div class="item-circle" :class="'item-circle-row' + index">
          <svg-icon icon-class="cat" v-if="item.dd === formData.currentTime" />
          <div class="box">
            <p class="text">{{ item.dd }}</p>
            <div class="top_ball one"></div>
            <div class="top_ball two"></div>
            <div class="top_ball three"></div>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot">{{ item.dd === formData.currentTime ? formData.currentTime : "" }}</span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <p class="bottom-title">{{ item.weekName }}</p>
      </li>

    </ul>

  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import moment from 'moment'
import { ElIcon } from 'element-plus'
import { More } from '@element-plus/icons-vue'
// 随机颜色 =>  '#' + Math.random().toString(16).substr(2, 8).toUpperCase();

let formData: any = reactive({
  taskData: [],
  currentTime: moment().format('DD') //new Date().format('dd')
});

const getWeekDay = (dateString) => {
  let dateStringReg = /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/;
  if (dateString.match(dateStringReg)) {
    let presentDate = new Date(dateString),
      today = presentDate.getDay() !== 0 ? presentDate.getDay() : 7;
    return Array.from(new Array(7), function (val, index) {
      return formatDate(
        new Date(
          presentDate.getTime() - (today - index - 1) * 24 * 60 * 60 * 1000
        ), index
      );
    });
  } else {
    throw new Error(
      'dateString should be like "yyyy-MMM-dd" or "yyyy/MMM/dd"'
    );
  }
  function formatDate(date, index) {
    const weekName = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天']
    return {
      date: moment(date).format('yyyy-MM-DD'), // new Date(date).format('yyyy-MMM-dd'),
      dd: moment(date).format('DD'), //new Date(date).format('dd'),
      weekName: weekName[index]
    };
  }

};

// formData.taskData = getWeekDay(new Date().format('yyyy-MMM-dd'));
formData.taskData = getWeekDay(moment().format('yyyy-MM-DD'));

</script>


<style lang="scss" scoped>
.app-box {
  width: 692px;
  background: var(--background-color-white);
  border-radius: 10px;
  margin: 0 20px 15px;
  position: relative;

  .transform {
    transform: perspective(10px);
  }

  // .message-box
  .message-box {
    .el-icon-more {
      transform: rotate(90deg);
      cursor: pointer;
      margin-right: 15px;
    }
  }

  // .message-box --end

  // applet-box
  .applet-box {
    padding: 10px 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;

    li {
      text-align: center;
      padding: 10px 20px;
      cursor: pointer;
      margin-top: 5px;
      transition: all 0.3s;
      border-radius: 16px;

      p {
        font-size: 12px;
        width: 56px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
        color: $color-text-primary;
        height: 22px;

        .el-input {
          height: 22px;
          line-height: 22px;
        }
      }

      .bottom-title {
        margin-top: 5px;
      }
    }

    li:hover {
      background: #f3f6f9;
      box-shadow: 0 12px 30px 0 rgb(0 0 0 / 20%);
      transform: translateY(-4px);
    }

    li.transform:hover svg {
      transform: translateY(-42px);
    }

    li.transform:hover .box {
      transform: translateY(-40px);
    }
  }

  // applet-box --end

  .tags {
    position: fixed;
    width: 100px;
    background-color: #fff;
    z-index: 1024;
    border-radius: 5px;
    -webkit-box-shadow: 1px 2px 10px #ccc;
    box-shadow: 1px 2px 10px #ccc;
  }

  .tags .item {
    cursor: pointer;
    font-size: 14px;
    padding: 8px 20px 8px 15px;
    color: #606266;
  }

  .tags .item:hover {
    background-color: #409eff;
    color: #fff;
  }

  .tags .item:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}

// ----- 旋转 ---------
.item-circle {
  width: 50px;
  height: 50px;
  position: relative;
  overflow: hidden;
  padding: 5px 0;
  box-sizing: border-box;
  display: inline-block;

  svg {
    font-size: 40px;
    transition: all 0.3s ease-in;
  }

  .box {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    transition: all 0.35s ease-in;
  }

  /* 电量文字 */
  .text {
    font-weight: 200;
    font-size: 15px;
    line-height: 42px;
    height: 42px !important;
  }

  /* 电量文字 */
  .text span {
    font-size: 15px;
  }

  /* 顶部的两个旋转小球 */
  .top_ball {
    width: 42px;
    height: 42px;
    border-radius: 35%;
    opacity: 0.5;
    position: absolute;

    z-index: 10;
    /* 从中心向外剪切圆，相当于掏空 */
    -webkit-mask: radial-gradient(transparent 18px, white 0px);
  }

  /* 顶部的两个旋转小球 */
  .top_ball.one {
    width: 41px;
    background: rgb(213 138 226);
    animation: ballZhuan 5s linear infinite;
  }

  /* 顶部的两个旋转小球 */
  .top_ball.two {
    background: #66d894b3;
    animation: ballZhuan 8s linear infinite;
  }

  .top_ball.three {
    width: 43px;
    background: #de8444b3;
    animation: ballZhuan 10s linear infinite;
  }

  @keyframes ballZhuan {
    100% {
      transform: rotate(360deg);
    }
  }

  /* 底部的小球 */
  .dot {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #66d894b3;
    position: absolute;
    z-index: -1;
    bottom: -20px;
    font-size: 12px;
  }

  .dot:nth-of-type(1) {
    width: 5px;
    height: 5px;
    right: 43px;

    animation: dotMove 6s linear infinite;
  }

  .dot:nth-of-type(2) {
    width: 7px;
    height: 7px;
    left: 42px;
    animation: dotMove 7s linear infinite;
  }

  .dot:nth-of-type(3) {
    animation: dotMove 4s linear infinite;
  }

  .dot:nth-of-type(4) {
    width: 15px;
    height: 15px;
    left: 34px;
    animation: dotMove 3s linear infinite;
  }

  .dot:nth-of-type(5) {
    width: 7px;
    height: 7px;
    animation: dotMove 5s linear infinite;
    background-color: #8a2be275;
  }

  @keyframes dotMove {
    0% {
      transform: translateY(0);
      opacity: 1;
    }

    98% {
      opacity: 1;
    }

    100% {
      transform: translateY(-72px);
      opacity: 0;
    }
  }
}

// -------- 选中
.transform .dot:nth-of-type(1) {
  width: 5px;
  height: 5px;
  right: 43px;
  animation: dotMoveDiy 5s linear infinite;
}

.transform .dot:nth-of-type(2) {
  width: 7px;
  height: 7px;
  left: 42px;
  animation: dotMoveDiy 6s linear infinite;
}

.transform .dot:nth-of-type(3) {
  animation: dotMoveDiy 3s linear infinite;
}

.transform .dot:nth-of-type(4) {
  width: 15px;
  height: 15px;
  left: 34px;
  animation: dotMoveDiy 2s linear infinite;
}

.transform .dot:nth-of-type(5) {
  width: 7px;
  height: 7px;
  animation: dotMoveDiy 4s linear infinite;
  background-color: #8a2be275;
}

@keyframes dotMoveDiy {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  98% {
    opacity: 1;
  }

  100% {
    transform: translateY(-140px);
    opacity: 0;
  }
}

// -------选中 ---end
.item-circle-row0 .three {
  background-color: #409effa3 !important;
}

.item-circle-row0 .dot {
  background: #908ae0a3 !important;
}

.item-circle-row1 .three {
  background-color: #5540ffa3 !important;
}

.item-circle-row1 .dot {
  background: #5540ffa3 !important;
}

.item-circle-row2 .three {
  background-color: #d940ffa3 !important;
}

.item-circle-row2 .dot {
  background: #d940ffa3 !important;
}

.item-circle-row3 .three {
  background-color: #40e5ffa3 !important;
}

.item-circle-row3 .dot {
  background: #40e5ffa3 !important;
}

.item-circle-row4 .three {
  background-color: #40ffa7a3 !important;
}

.item-circle-row4 .dot {
  background: #40ffa7a3 !important;
}

.item-circle-row5 .three {
  background-color: #d0da3ba3 !important;
}

.item-circle-row5 .dot {
  background-color: #d0da3ba3 !important;
}
</style>