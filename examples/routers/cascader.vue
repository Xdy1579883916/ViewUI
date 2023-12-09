<template>
    <div style="margin: 100px;width: 200px;">
        <Cascader :data="data" v-model="value1"></Cascader>
        {{ value1 }}
        <DxbCascade :data="data" v-model="value2" complete></DxbCascade>
        {{ value2 }}
    </div>
</template>
<script>
    import {h} from "vue";

    export default {
        data () {
            return {
                value1: [],
                value2: [],
                data: [
                    {
                        label: "新建分组", // 必填
                        plugin: true, // 必填
                        value: "addNewGroup", // 必填
                        render: () => h("div", "新建分组"), // render函数 选填
                        class: "xx" // 自定义的当行样式
                    },
                    {
                    value: 'beijing',
                    label: '北京',
                    children: [
                        {
                            value: 'gugong',
                            label: '故宫'
                        },
                        {
                            value: 'tiantan',
                            label: '天坛'
                        },
                        {
                            value: 'wangfujing',
                            label: '王府井'
                        }
                    ]
                },
                    {
                    value: 'jiangsu',
                    label: '江苏',
                    children: [
                        {
                            value: 'nanjing',
                            label: '南京',
                            children: [
                                {
                                    value: 'fuzimiao',
                                    label: '夫子庙',
                                }
                            ]
                        },
                        {
                            value: 'suzhou',
                            label: '苏州',
                            children: [
                                {
                                    value: 'zhuozhengyuan',
                                    label: '拙政园',
                                },
                                {
                                    value: 'shizilin',
                                    label: '狮子林',
                                }
                            ]
                        }
                    ],
                },
                ]
            };
        }
    };
</script>
