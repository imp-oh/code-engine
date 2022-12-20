<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2020-09-18 13:37:48
 * @LastEditTime: 2022-02-14 15:31:56
 * @Description: ...每位新修改者自己的信息
-->
<template>
  <div
    class="titlebtn"
    :class="styleClass"
    @click="methods.click"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
const { ipcRenderer: ipc } = require("electron");
export default defineComponent({
  name: "TitleButton",
  props: ["type", "styleClass"],
  setup(props, ctx) {
    const methods = {
      click: () => {
        ipc.send('window-controls',props.type);
      },
    };
    return { methods };
  },
});
</script>

<style>
.titlebtn {
  position: absolute;
  top: 8px;
  width: 13px;
  height: 13px;
  -webkit-app-region: no-drag;
  border-radius: 50%;
  cursor: pointer;
  background: #5c627c;
}
.titlebtn:hover {
  border: 1px solid rgba(248, 242, 242, 0.6);
}

.close {
  background: #ff6059;
}
.min {
  background: #28ca42;
}
.max {
  background: #ffbd2e;
}
.min {
  right: 65px;
}
.max {
  right: 40px;
}
.close {
  right: 15px;
}
</style>
