<template>
  <div id="app">
    <el-upload drag action :auto-upload="false" :show-file-list="false" :on-change="changeFile">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
    </el-upload>

    <!-- PROGRESS -->
    <div class="progress">
      <span>上传进度：{{total|totalText}}%</span>
      <el-link type="primary" v-if="total>0 && total<100" @click="handleBtn">{{btn|btnText}}</el-link>
    </div>

    <!-- VIDEO -->
    <div class="uploadImg" v-if="video">
      <video :src="video" controls />
    </div>
  </div>
</template>

<script>
import { fileParse } from "./assets/utils";
import axios from "axios";
import SparkMD5 from "spark-md5";

export default {
  name: "App",
  data() {
    return {
      total: 0,
      video: null,
      btn: false,
    };
  },
  filters: {
    btnText(btn) {
      return btn ? "继续" : "暂停";
    },
    totalText(total) {
      return total > 100 ? 100 : total;
    },
  },
  methods: {
    async changeFile(file) {
      if (!file) return;
      file = file.raw;

      // 解析为BUFFER数据
      // 我们会把文件切片处理：把一个文件分割成为好几个部分（固定数量/固定大小）
      // 每一个切片有自己的部分数据和自己的名字
      // HASH_1.mp4
      // HASH_2.mp4
      // ...
      let buffer = await fileParse(file, "buffer"),
        spark = new SparkMD5.ArrayBuffer(),
        hash,
        suffix;
      spark.append(buffer);
      hash = spark.end();
      suffix = /\.([0-9a-zA-Z]+)$/i.exec(file.name)[1];

      // 创建100个切片
      let partList = [],
        partsize = file.size / 100,
        cur = 0;
      for (let i = 0; i < 100; i++) {
        let item = {
          chunk: file.slice(cur, cur + partsize),
          filename: `${hash}_${i}.${suffix}`,
        };
        cur += partsize;
        partList.push(item);
      }

      this.partList = partList;
      this.hash = hash;
      this.sendRequest();
    },
    async sendRequest() {
      // 根据100个切片创造100个请求（集合）
      let requestList = [];
      this.partList.forEach((item, index) => {
        // 每一个函数都是发送一个切片的请求
        let fn = () => {
          let formData = new FormData();
          formData.append("chunk", item.chunk);
          formData.append("filename", item.filename);
          return axios
            .post("/single3", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((result) => {
              result = result.data;
              if (result.code == 0) {
                this.total += 1;
                // 传完的切片我们把它移除掉
                this.partList.splice(index, 1);
              }
            });
        };
        requestList.push(fn);
      });

      // 传递：并行(ajax.abort())/串行(基于标志控制不发送)
      let i = 0;
      let complete = async () => {
        let result = await axios.get("/merge", {
          params: {
            hash: this.hash,
          },
        });
        result = result.data;
        if (result.code == 0) {
          this.video = result.path;
        }
      };
      let send = async () => {
        // 已经中断则不再上传
        if (this.abort) return;
        if (i >= requestList.length) {
          // 都传完了
          complete();
          return;
        }
        await requestList[i]();
        i++;
        send();
      };
      send();
    },
    handleBtn() {
      if (this.btn) {
        //断点续传
        this.abort = false;
        this.btn = false;
        this.sendRequest();
        return;
      }
      //暂停上传
      this.btn = true;
      this.abort = true;
    },
  },
};
</script>