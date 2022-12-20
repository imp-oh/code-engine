<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-30 10:35:52
 * @LastEditTime: 2021-06-30 10:37:34
 * @Description: ...每位新修改者自己的信息
 * @url: https://blog.csdn.net/weixin_45952652/article/details/116449330
-->
<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
  >
    <use
      :xlink:href="iconName"
      :fill="color"
    />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#889aa4",
    },
  },
  setup(props) {
    return {
      iconName: computed(() => `#icon-${props.iconClass}`),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`;
        }
        return "svg-icon";
      }),
    };
  },
});
</script>

<style scope>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: middle;
}
</style>