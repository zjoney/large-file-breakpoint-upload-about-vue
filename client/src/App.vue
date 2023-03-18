<template>
  <div id="app">
    <!-- 
      action:存放的是文件上传到服务器的接口地址
    -->
    <el-upload
      drag
      action="/single1"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
    </el-upload>

    <!-- IMG -->
    <div class="uploadImg" v-if="img">
      <img :src="img" alt />
    </div>
  </div>
</template>

<script>
/*
 * 文件上传有两套方案：
 *   1. 基于文件流（form-data）  element-ui上传组件默认是基于文件流的
 *   2. 客户端需要把文件转化为BASE64
 *
 * 默认上传
 *   格式：multipart/form-data
 *   数据格式：form-data
 *      file 文件流信息
 *      filename 文件名字
 *   上传成功后获取服务器返回信息，通知on-success回调函数执行
 * 内部封装了ajax
 */
export default {
  name: "App",
  data() {
    return {
      img: null,
    };
  },
  methods: {
    handleSuccess(result) {
      if (result.code == 0) {
        this.img = result.path;
      }
    },
    beforeUpload(file) {
      // 格式校验
      let { type, size } = file;

      if (!/(png|gif|jpeg|jpg)/i.test(type)) {
        this.$message("文件合适不正确~~");
        return false;
      }

      if (size > 200 * 1024 * 1024) {
        this.$message("文件过大，请上传小于200MB的文件~~");
        return false;
      }

      return true;
    },
  },
};
</script>

