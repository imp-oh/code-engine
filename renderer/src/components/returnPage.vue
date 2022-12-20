<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-30 10:29:06
 * @LastEditTime: 2021-12-22 13:57:31
 * @Description:  导航左侧带返回箭头
-->

<script setup lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TitleButton from '@/components/TitleButton.vue'
import { ArrowLeft } from '@element-plus/icons-vue';

defineProps({
  leftButton: {
    type: Boolean,
    default: true
  },
  rightButton: {
    type: Boolean,
    default: true
  }
})

let router: any = useRouter()
let route: any = useRoute()
const formData = reactive({})

const returnPage = () => {
  if (route.query.path) {
    return router.push(route.query.path)
  }
  return router.push('/')
}

</script>
<template>

  <div class="background">
    <div id="system">

      <div class="right" v-if="rightButton">
        <TitleButton type="min" style-class="min" />
        <TitleButton type="max" style-class="max" />
        <TitleButton type="close" style-class="close" />
      </div>

      <slot name="center"></slot>

      <el-icon v-if="leftButton" class="left" @click="returnPage" siez="12px">
        <ArrowLeft class="el-icon-arrow-left"  />
      </el-icon>


    </div>

    <main class="main">
      <slot />
    </main>
  </div>

</template>


<style lang="scss" scoped>
.background {
  height: 100%;
}

#system {
  width: 100%;
  height: 30px;
  -webkit-app-region: drag;
  // -webkit-user-select: none;
  position: relative;
  z-index: 99;
  top: 9px;
  left: 0;
  display: flex;
  align-content: stretch;
  justify-content: space-around;
  flex-wrap: nowrap;
  flex-direction: column;

  .system-search-box {
    -webkit-app-region: no-drag;
    position: absolute;
    left: 50%;
    margin-left: -100px;

    .search-button {
      width: 28px;
      height: 28px;
      position: absolute;
      right: 0;
      cursor: pointer;
    }
  }

  .left {
    position: absolute;
    -webkit-app-region: no-drag;
    left: 15px;
    cursor: pointer;
    .el-icon-arrow-left{
      width:16px
    }
  }

  .right {
    display: inline-block;
  }
}

.main {
  height: calc(100% - 39px);
  overflow: hidden;
  margin-top: 9px;
}
</style>