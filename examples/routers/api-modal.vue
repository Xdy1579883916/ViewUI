<script>
import RemarkModal from '../components/RemarkModal.vue';

export default {
    data() {
        return {};
    },
    methods: {
        open () {
            this.$DxbModal.confirm({
                headTitle: '备注',
                width: 1000,
                render: RemarkModal,
                props: {
                    props: {
                        open: this.open
                    }
                },
                footerShow: false,
                onOk: () => {
                    this.$Message.info('点击了确定');
                },
                onCancel: () => {
                    this.$Message.info('点击了取消');
                }
            });
        }
    }
};
</script>

<template>
    <div>
        <h1>店小宝 modal</h1>
        <Button @click="open">打卡</Button>
    </div>
</template>

<style scoped>

</style>
