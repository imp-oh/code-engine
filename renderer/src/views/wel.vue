<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-07-06 15:20:24
 * @LastEditTime: 2022-02-28 10:25:41
 * @Description: ...每位新修改者自己的信息
-->


<script setup lang="ts">
import { defineComponent, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElInput } from 'element-plus'
import TitleButton from '@/components/TitleButton.vue'
import lnk from '@/components/wel/lnk.vue'
import stickyNote from '@/components/wel/stickyNote.vue'
import taskbar from '@/components/wel/taskbar.vue'
import message from '@/components/wel/message.vue'
import system from '@/components/wel/system.vue'

let router = useRouter()

let formData = reactive({
  appletData: [],
  search: ''
})

let handleQuery = () => {
  router.push({
    name: 'appleStore',
    params: {
      search: formData.search
    }
  })
}
</script>

<template>
  <div class="backround">
    <div id="system">
      <TitleButton type="min" style-class="min" />
      <TitleButton type="max" style-class="max" />
      <TitleButton type="close" style-class="close" />

      <div class="system-search-box">
        <el-input class="search" size="default" style="width: 200px;" maxlength="100" v-model="formData.search"
          spellcheck="false" @change="handleQuery()"></el-input>
        <svg-icon icon-class="search" class="search-button" @click="handleQuery()"></svg-icon>
      </div>

      <div class="right">
        <svg-icon icon-class="apply" class="ddd" style="cursor: pointer;" />
      </div>
    </div>

    <main class="main">
      <div class="wel">
        <lnk></lnk>
        <sticky-note></sticky-note>
        <taskbar></taskbar>
        <message></message>
        <system></system>
      </div>
    </main>

  </div>
</template>



<style lang="scss">
#system {
  .system-search-box {
    .el-input__wrapper {
      box-shadow: none;
      border-radius: 18px;
    }

    .el-input__inner {
      border: none;
      background-color: white !important;
      padding-right: 30px;
      height: 28px;
      line-height: 28px;
    }
  }
}

.wel {
  .el-dropdown-diy {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  // .message-box
  .message-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;

    .el-icon-more {
      transform: rotate(90deg);
      cursor: pointer;
      margin-right: 15px;
    }

    .left {
      padding-left: 10px;
      min-width: 130px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-size: $--font-size-small;

      svg {
        font-size: $--font-size-medium;
        margin-right: 5px;
      }

      span {
        color: var(--color-text-primary);
      }
    }

    .right {
      width: 24px;
    }
  }

  // .message-box --end
}
</style>

<style lang="scss" scoped>
.backround {
  background: var(--background-color);
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

#app {
  .main {
    height: calc(100% - 30px);
    overflow: hidden;
  }

  // ---.main ---end

  #system {
    width: 100%;
    height: 30px;
    -webkit-app-region: drag;
    // -webkit-user-select: none;
    position: relative;
    z-index: 99;
    top: 9px;
    left: 0;

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

    .right {
      position: absolute;
      -webkit-app-region: no-drag;
      left: 15px;

      .svg-icon:hover {
        cursor: pointer;
      }
    }
  }
}

.wel {
  padding-top: 15px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>