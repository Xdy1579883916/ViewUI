<template>
    <div class="inputModal">
        <Form
            ref="form"
            :model="formData"
        >
            <FormItem
                prop="data"
                :rules="itemRule"
                style="margin-bottom:0"
            >
                <Input
                    v-model="formData.data"
                    :type="itemType"
                    style="width:350px;"
                />
            </FormItem>
        </Form>
        <div class="modal-footer mt20">
            <Button @click="$emit('quit')">
                取消
            </Button>
            <Button
                type="primary"
                @click="handleOk()"
            >
                完成
            </Button>
            <Button
                type="primary"
                @click="open()"
            >
                套娃
            </Button>
        </div>

        <span><router-link to="/list">List</router-link></span>
    </div>
</template>
<script>

export default {
    name: "InputModal",
    props: {
        open: {
            type: Function,
        },
        labelName: {
            type: String,
            default: "数据"
        },
        itemRule: {
            type: Array,
            default(){
                return []
            }
        },
        itemType: {
            type: String,
            default: 'text'
        }
    },
    data() {
        return {
            formData: {
                data: ""
            }
        }
    },
    methods: {
        async handleOk() {
            let check = await this.$refs.form.validate()
            if (!check) {
                this.$Message.error('填写的数据格式不正确！')
                return
            }
            this.$emit('ok', this.formData.data)
        }
    }
}
</script>

<style lang="less" scoped>
.inputModal {
    .inputModal-inner {
        max-height: 60vh;
        overflow-y: auto;
    }
}
</style>
