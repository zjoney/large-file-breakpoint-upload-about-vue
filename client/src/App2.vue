<template>
  <div id="app">
    <el-upload drag action :auto-upload="false" :show-file-list="false" :on-change="changeFile">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
    </el-upload>

    <!-- IMG -->
    <div class="uploadImg" v-show="img">
      <img :src="img" alt />
    </div>
  </div>
</template>

<script>
import { fileParse } from "./assets/utils";
import axios from "axios";
import qs from "qs";

export default {
  name: "App",
  data() {
    return {
      img: null,
    };
  },
  methods: {
    async changeFile(file) {
      if (!file) return;
      file = file.raw;
      // 继续做格式校验
      /*
       * 把上传的文件先进行解析（FileReader）
       * 把其转换base64编码格式
       * 自己基于axios把信息传递给服务器
       * ...
       */
      let result = await fileParse(file, "base64");
      result = await axios.post(
        "/single2",
        qs.stringify({
          chunk: encodeURIComponent(result),
          filename: file.name,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      result = result.data;
      if (result.code == 0) {
        this.img = result.path;
      }
    },
  },
};
</script>