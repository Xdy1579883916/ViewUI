import Vue from 'vue';
import Modal from './modal.vue';
import Button from '../button/button.vue';
import Locale from '../../mixins/locale';
import {clone} from 'lodash';
import DxbModalHeader from './DxbModalHeader.vue';

const prefixCls = 'ivu-modal-confirm';

let seed = 0;
const now = Date.now();

function guid () {
    return 'ivuDxbModal_' + now + '_' + (seed++);
}

Modal.newInstance = (initVueOpt, properties, resolve, reject) => {
    const $id = guid();
    const _props = properties || {};
    const initData = {
        visible: false,
        width: 416,
        title: '',
        body: '',
        iconType: '',
        iconName: '',
        okText: undefined,
        cancelText: undefined,
        showCancel: false,
        loading: false,
        buttonLoading: false,
        scrollable: false,
        closable: false,
        closing: false, // 关闭有动画，期间使用此属性避免重复点击
        // -----------⬇️ 自定义改动的数据
        okType: 'primary',
        headTitle: '',
        headRender: undefined,
        footerRender: undefined,
        footerShow: true,
        props: {},
        footerProps: {},
        render: undefined,
        showOk: true,
        // zIndex: 1000
    };

    const Instance = new Vue({
        ...initVueOpt,
        mixins: [Locale],
        data: Object.assign({}, _props, initData),
        computed: {
            localeOkText() {
                if (this.okText) {
                    return this.okText;
                } else {
                    return this.t('i.modal.okText');
                }
            },
            localeCancelText() {
                if (this.cancelText) {
                    return this.cancelText;
                } else {
                    return this.t('i.modal.cancelText');
                }
            }
        },
        methods: {
            cancel(data = {}) {
                if (this.closing) return;
                this.$children[0].visible = false;
                this.buttonLoading = false;

                this.handleDiyCancel(data);
                this.remove();
            },
            ok(data = {}) {
                if (this.closing) return;
                if (this.loading) {
                    this.buttonLoading = true;
                } else {
                    this.$children[0].visible = false;
                    this.remove();
                }
                this.handleDiyOk(data);
            },
            remove() {
                this.closing = true;
                setTimeout(() => {
                    this.closing = false;
                    this.destroy();
                }, 300);
            },
            destroy() {
                this.$destroy();
                if (this.$el) document.body.removeChild(this.$el);
                this.onRemove();
            },
            handleDiyOk(data) {
                const _data = Object.prototype.toString.call(data) !== '[object PointerEvent]' ? data : undefined;
                this.onOk && this.onOk(_data, this);
                // promise状态下没有办法重置 当前实例的 buttonLoading [加载中],因为此时已经promise已经回调结束了
                resolve && resolve(_data);
            },
            handleDiyCancel(data) {
                const _data = Object.prototype.toString.call(data) !== '[object PointerEvent]' ? data : undefined;
                this.onCancel && this.onCancel(_data, this);
                // promise状态下没有办法重置 当前实例的 buttonLoading [加载中],因为此时已经promise已经回调结束了
                reject && reject(_data);
            },
        },
        render(h) {
            // render 正文 body
            let body_render;
            if (this.render) {
                // console.log(this.render(h))
                let $props = clone(this.props);
                let {on = {}, props = {}} = this.props;
                $props['on'] = Object.assign(on, {
                    ok: this.ok,
                    quit: this.cancel
                });
                $props['props'] = Object.assign(props, {
                    buttonLoading: this.buttonLoading
                });
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body ${prefixCls}-body-render`
                    },
                }, [
                    h(this.render, $props)
                ]);
            } else {
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body ${prefixCls}-body-render`
                    },
                }, [
                    h('div', {
                        domProps: {
                            innerHTML: this.body
                        }
                    })
                ]);
            }

            // 当没有标题渲染时，隐藏头部 render 优先
            let head_render;
            if (this.headRender) {
                head_render = this.headRender(h);
            } else if (this.headTitle) {
                head_render = h(DxbModalHeader, {
                    props: {
                        title: this.headTitle
                    },
                });
            }

            // render 底部导航 footer
            let footerVNodes = [];
            if (this.showCancel) {
                footerVNodes.push(h(Button, {
                    props: {
                        type: 'default'
                    },
                    on: {
                        click: this.cancel
                    }
                }, this.localeCancelText));
            }
            if (this.showOk) {
                footerVNodes.push(h(Button, {
                    props: {
                        type: this.okType,
                        loading: this.buttonLoading
                    },
                    on: {
                        click: this.ok
                    }
                }, this.localeOkText));
            }

            let footer_render;
            if (this.footerRender) {
                let $props = clone(this.footerProps);
                let {on = {}, props = {}} = this.footerProps;
                $props['on'] = Object.assign(on, {
                    ok: this.ok,
                    quit: this.cancel
                });
                $props['props'] = Object.assign(props, {
                    buttonLoading: this.buttonLoading
                });
                footer_render = h('div', {
                    // 直接设置 vue可以帮我们对class进行合并
                    class: `mt${this.marginTB}`, // ${prefixCls}-footer
                    // 通过attrs设置 那就只有这个class
                    /*attrs: {
                      class: `mt${this.marginTB}`, // ${prefixCls}-footer
                    },*/
                }, [
                    h(this.footerRender, $props)
                ]);

            } else if (this.footerShow) {
                footer_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-footer`
                    }
                }, footerVNodes);
            }

            // 生成弹窗组件
            return h(Modal, {
                props: Object.assign({}, _props, {
                    width: this.width,
                    scrollable: this.scrollable,
                    closable: this.closable
                }),
                domProps: {
                    value: this.visible
                },
                on: {
                    input: (status) => {
                        this.visible = status;
                    },
                    'on-cancel': this.cancel
                }
            }, [
                h('div', {
                    attrs: {
                        class: prefixCls,
                    },
                    style: {
                        padding: 0
                    },
                }, [
                    head_render,
                    body_render,
                    footer_render
                ])
            ]);
        }
    });

    const component = Instance.$mount();
    component.$el.id = $id;
    document.body.appendChild(component.$el);
    const modal = Instance.$children[0];

    return {
        show(props) {
            Object.assign(modal.$parent, props);
            // notice when component destroy
            modal.$parent.onRemove = props.onRemove;

            modal.visible = true;
        },
        remove() {
            modal.visible = false;
            modal.$parent.buttonLoading = false;
            modal.$parent.remove();
        },
        component: modal,
        $id
    };
};

export default Modal;
