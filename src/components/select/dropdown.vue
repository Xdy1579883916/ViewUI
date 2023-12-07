<template>
  <div class="ivu-select-dropdown" :class="className" :style="styles">
    <slot></slot>
  </div>
</template>
<script>
import Vue from 'vue';
import {createPopper} from '@popperjs/core';

import {getStyle} from '../../utils/assist';
import {transferIncrease, transferIndex} from '../../utils/transfer-queue';

const isServer = Vue.prototype.$isServer;

export default {
    name: 'Drop',
    props: {
        placement: {
            type: String,
            default: 'bottom-start'
        },
        className: {
            type: String
        },
        transfer: {
            type: Boolean
        },
    // 4.6.0
        eventsEnabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            popper: null,
            width: '',
            popperStatus: false,
            tIndex: this.handleGetIndex()
        };
    },
    computed: {
        styles() {
            let style = {};
            if (this.width) style.minWidth = `${this.width}px`;

            if (this.transfer) style['z-index'] = 1060 + this.tIndex;

            return style;
        }
    },
    methods: {
        update() {
            if (isServer) return;
            this.$nextTick(() => {
                if (this.popper) {
                    this.popper.forceUpdate();
                    this.popperStatus = true;
                } else {
                    this.popper = createPopper(this.$parent.$refs.reference, this.$el, {
                        eventsEnabled: this.eventsEnabled,
                        placement: this.placement,
                        modifiers: [
                            {
                                name: 'computeStyles',
                                options: {
                                    gpuAcceleration: false, // true by default
                                },
                            },
                            {
                                name: 'preventOverflow',
                                options: {
                                    boundariesElement: 'window'
                                },
                            },
                        ],
                        onFirstUpdate: () => {
                            this.resetTransformOrigin();
                            this.$nextTick(this.popper.forceUpdate());
                        },
                        afterWrite: () => {
                            this.resetTransformOrigin();
                        }
                    });
                }
        // set a height for parent is Modal and Select's width is 100%
                if (this.$parent.$options.name === 'iSelect') {
                    this.width = parseInt(getStyle(this.$parent.$el, 'width'));
                }
                this.tIndex = this.handleGetIndex();
            });
        },
        destroy() {
            if (this.popper) {
                setTimeout(() => {
                    if (this.popper && !this.popperStatus) {
                        //fix:#910
                        this.popper.state.elements.popper.style.display = 'none';
                        this.popper.destroy();
                        this.popper = null;
                    }
                    this.popperStatus = false;
                }, 300);
            }
        },
        resetTransformOrigin() {
      // 不判断，Select 会报错，不知道为什么
            if (!this.popper) return;

            let x_placement = this.popper.state.elements.popper.getAttribute('data-popper-placement');
            let placementStart = x_placement.split('-')[0];
            let placementEnd = x_placement.split('-')[1];
            const leftOrRight = x_placement === 'left' || x_placement === 'right';
            if (!leftOrRight) {
                this.popper.state.elements.popper.style.transformOrigin = placementStart === 'bottom' || (placementStart !== 'top' && placementEnd === 'start') ? 'center top' : 'center bottom';
            }
        },
        handleGetIndex() {
            transferIncrease();
            return transferIndex;
        },
    },
    created() {
        this.$on('on-update-popper', this.update);
        this.$on('on-destroy-popper', this.destroy);
    },
    beforeDestroy() {
        this.$off('on-update-popper', this.update);
        this.$off('on-destroy-popper', this.destroy);
        if (this.popper) {
            this.popper.destroy();
            this.popper = null;
        }
    }
};
</script>
