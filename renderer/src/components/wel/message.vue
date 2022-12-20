<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-20 09:04:20
 * @LastEditTime: 2022-02-28 10:21:57
 * @Description: 消息通知
-->
<script setup lang="ts">
import { reactive } from 'vue'
import { ElInput } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

const formData: any = reactive({
  textarea: "今天负责主要项目有很多问题，需要进度阿萨大厦"
})
</script>


<template>
  <div class="cap-message">
    <div class="message-box no-user-select">
      <div class="left">
        <!-- <svg-icon icon-class="message"></svg-icon> -->
        <svg-icon icon-class="devil"></svg-icon>
        <span>消息</span>
      </div>
      <div class="right">
        <el-icon siez="14px" class="no-inherit">
          <ArrowRight class="el-icon-arrow-right" />
        </el-icon>
      </div>
    </div>
    <div class="content-box">
      <ul>
        <li><a href="https://www.xxxxx.top/updata.html" target='_blank'>0.0.5 版本更新</a></li>
      </ul>
    </div>
  </div>
</template>




<style lang="scss" scoped>
.cap-message {
  color: #303133;
  min-width: 214px;
  background: var(--background-color-white);
  border-radius: 10px;
  position: relative;
  margin-bottom: 15px;
  margin-right: 20px;

  // .message-box
  .message-box {
    .el-icon-more {
      transform: rotate(90deg);
      cursor: pointer;
      margin-right: 15px;
    }

    .right {
      i {
        font-size: 14px;
        cursor: pointer;
      }
    }
  }

  // .message-box --end

  .content-box {
    padding: 10px;

    ul {
      font-size: 12px;

      li {
        a {
          text-decoration: none;
          color: var(--color-text-primary);
        }
      }

      li:hover a {
        cursor: pointer;
        color: var(--color-text-primary-hover);
      }
    }
  }
}
</style>