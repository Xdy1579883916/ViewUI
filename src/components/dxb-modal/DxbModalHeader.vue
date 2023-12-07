<template>
  <div class="DxbModalHeader ivu-modal-header">
    <slot>
      <div
        class="ivu-modal-header-inner"
        v-html="title"
      />
    </slot>
  </div>
</template>
<script>
  export default {
      name: 'DxbModalHeader',
      props: {
          title: [String, Number],
      },
  };
</script>

<style lang="less" scoped>
  .DxbModalHeader {
    padding: 0 0 14px 0;
    border-bottom: none;
    margin-bottom: 0 !important;
    .ivu-modal-header-inner {
      font-weight: 600;
    }
  }
</style>
