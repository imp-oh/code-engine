<!--
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2022-01-21 09:28:43
 * @LastEditTime: 2022-01-27 14:26:20
 * @Description: ...每位新修改者自己的信息
-->

<script setup lang="ts">
import { defineComponent, reactive } from "vue";
// import { versions } from "@/global";
let { env } = process
let from: any = reactive({
  isShow: false,
  CodeEngine: {
    CE_VERSION:env.CE_VERSION,
    ELECTRON_VERSION:env.ELECTRON_VERSION
  }
});
console.log(from)

let handleOpenCopy = () => { };
</script>

<template>
  <return-page class="copy">

    <div class="copy-box">
      <el-row :gutter="20">
        <el-col :span="12">
          <span class="link">CodeEngine版本：{{ from.CodeEngine.CE_VERSION }}</span>
        </el-col>
        <el-col :span="12">
          <span class="link">Electron版本：{{ from.CodeEngine.ELECTRON_VERSION }}</span>
        </el-col>
      </el-row>

      <el-row class="padding-top-20">
        <el-col :span="12">
          <el-link type="primary" href="https://www.xxxxx.top" target="_blank">软件下载</el-link>
        </el-col>

        <el-col :span="12">
          <el-link type="primary" href="https://www.xxxxx.top/api.html" target="_blank">小程序开发文档</el-link>
        </el-col>
      </el-row>

      <el-row class="padding-top-20">
        <el-col :span="12">
          <span class="link" @click="from.isShow = true">免责声明</span>
        </el-col>

      </el-row>
    </div>

    <el-dialog v-model="from.isShow" title="免责声明">
      <div>
        1、本软件属于个人的非赢利性软件，免费开放。<br />
        2、本站小程序、软件、仅供学习参考，如有侵犯您的版权，<a
          href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=Hn1xent7e2pxbl5vbzB9cXM" title="我的邮箱"
          target="_blank">请联系我们</a>，本站将在三个工作日内改正。<br />
        3、图片素材来源于网络，如有侵犯您的版权，<a href="http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=Hn1xent7e2pxbl5vbzB9cXM"
          title="我的邮箱" target="_blank">请联系我们</a>，本站将在三个工作日内改正。<br />
        4、复制或建立镜像，如有违反，追究法律责任。<br />
        5.请在官网商店下载小程序安装包。
      </div>
    </el-dialog>

  </return-page>
</template>




<style lang="scss" scoped>
.copy {
  .copy-box {
    width: 400px;
    margin: 5px auto;
    font-size: 14px;
    text-align: center;
    color: $color-text-primary;

    .padding-top-20 {
      padding-top: 20px;
    }

    .link {
      cursor: pointer;
    }

    .link:hover {
      color: rgba(59, 130, 246, 0.8);
    }
  }
}
</style>