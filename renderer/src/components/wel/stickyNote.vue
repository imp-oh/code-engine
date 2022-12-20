<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-20 09:04:20
 * @LastEditTime: 2022-02-28 10:22:06
 * @Description: 便签
-->


<script setup lang="ts">
import { defineComponent, reactive, watch, onMounted } from 'vue'
import { ElInput } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import DB from '@/utils/db'
// import { sqliteDBSyanc } from '@/utils/sqlite'
let formData = reactive({
  textarea: "",
  id: ""
})
let staticData = {
  isAlter: false
}
// let systemDB = sqliteDBSyanc('system/system.db');
let db = new DB('system/system.db').getDB()

onMounted(() => {
  initData()
})

watch(formData, (newVal, oldVal) => {
  staticData.isAlter = true
})


const initData = async () => {
  const [row = {}] = await db.prepare("SELECT * FROM c_diary").all()
  if (row.id) {
    formData.textarea = row.content
    formData.id = row.id
  }
}

const handleKeyup = async (event) => {
  if (event.ctrlKey && event.keyCode === 83 && staticData.isAlter) {
    console.log(formData)
    if (formData.id) {
      let d = await db.prepare(`update c_diary set content='${formData.textarea}' WHERE id='${formData.id}'`).run()
      return
    }
    var s = await db.prepare(`INSERT INTO c_diary (id,content) values(?,?)`).run(new Date().getTime(), formData.textarea)
    staticData.isAlter = false
  }
}
</script>


<template>
  <div class="sticky-note-box">
    <div class="message-box no-user-select">
      <div class="left">
        <svg-icon icon-class="shortNote"></svg-icon>
        <span>便签</span>
      </div>
      <div class="right">
        <el-icon siez="14px" class="no-inherit">
          <ArrowRight class="el-icon-arrow-right" />
        </el-icon>

        <!-- <i class="el-icon-arrow-right"></i> -->
      </div>
    </div>
    <div class="content-box">
      <el-input class="textarea" type="textarea" autocomplete="off" spellcheck="false" v-model="formData.textarea"
        @keyup="handleKeyup" show-word-limit>
      </el-input>
    </div>
  </div>
</template>


<style lang="scss">
.sticky-note-box .content-box .el-textarea__inner {
  box-shadow: none;
  resize: none;
  font-size: 13px;
  padding: 0 5px;
  height: 170px;
}

.sticky-note-box .content-box .el-textarea__inner::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}

.sticky-note-box .content-box .el-textarea__inner::-webkit-scrollbar-track {
  /* background: rgb(239, 239, 239); */
  border-radius: 2px;
}

.sticky-note-box .content-box .el-textarea__inner::-webkit-scrollbar-thumb {
  /* background: #bfbfbf; */
  border-radius: 10px;
}

.sticky-note-box .content-box .el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: #333;
}

.sticky-note-box .content-box .el-textarea__inner::-webkit-scrollbar-corner {
  background: #2688d8;
}
</style>

<style lang="scss" scoped>
.sticky-note-box {
  min-width: 448px;
  min-height: 212px;
  background: var(--background-color-white);
  border-radius: 10px;
  position: relative;
  margin-bottom: 15px;

  // .message-box
  .message-box {
    .el-icon-more {
      transform: rotate(90deg);
      cursor: pointer;
      margin-right: 15px;
    }

    .right {
      .el-icon-arrow-right {
        cursor: pointer;
      }
    }
  }

  // .message-box --end

  .content-box {
    padding: 5px 10px 10px;
  }
}
</style>