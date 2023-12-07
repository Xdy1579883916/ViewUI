<template>
  <span>
    <ul
      v-if="data && data.length"
      :class="[prefixCls + '-menu']"
    >
      <!--            <DxbCasitem
              v-for="item in data"
              :key="getKey()"
              :prefix-cls="prefixCls"
              :data="item"
              :tmp-item="tmpItem"
              @click.native.stop="handleClickItem(item)"
              @mouseenter.native.stop="handleHoverItem(item)"></DxbCasitem>-->
      <DxbCasitem
        v-for="item in data"
        :key="getKey()"
        :prefix-cls="prefixCls"
        :data="item"
        :tmp-item="tmpItem"
        @handleClickPluginItem="handleClickPluginItem($event,item)"
        @handleClickItem="handleClickItem(item)"
        @mouseenter.native.stop="handleHoverItem(item)"
      />
    </ul>
    <DxbCaspanel
      v-if="sublist && sublist.length"
      :prefix-cls="prefixCls"
      :data="sublist"
      :disabled="disabled"
      :trigger="trigger"
      :change-on-select="changeOnSelect"
    />
  </span>
</template>
<script>
import DxbCasitem from './DxbCasitem';
import Emitter from '../../mixins/emitter';
import {findComponentDownward, findComponentUpward} from '../../utils/assist';

let key = 1;

export default {
    name: 'DxbCaspanel',
    components: { DxbCasitem },
    mixins: [ Emitter ],
    props: {
        data: {
            type: Array,
            default () {
                return [];
            }
        },
        disabled: Boolean,
        changeOnSelect: Boolean,
        trigger: String,
        prefixCls: String
    },
    data () {
        return {
            tmpItem: {},
            result: [],
            sublist: []
        };
    },
    watch: {
        data () {
            this.sublist = [];
        }
    },
    mounted () {
        this.$on('on-find-selected', (params) => {
            const val = params.value;
            const complete = params.complete;
            let value = [...val];
            for (let i = 0; i < value.length; i++) {
                for (let j = 0; j < this.data.length; j++) {
                    if ((complete ? value[i].value : value[i]) === this.data[j].value) {
                        this.handleTriggerItem(this.data[j], true);
                        value.splice(0, 1);
                        this.$nextTick(() => {
                            this.broadcast('DxbCaspanel', 'on-find-selected', {
                                value: value,
                                complete: complete
                            });
                        });
                        return false;
                    }
                }
            }
        });
    // deep for #1553
        this.$on('on-clear', (deep = false) => {
            this.sublist = [];
            this.tmpItem = {};
            if (deep) {
                const Caspanel = findComponentDownward(this, 'DxbCaspanel');
                if (Caspanel) {
                    Caspanel.$emit('on-clear', true);
                }
            }
        });
    },
    methods: {
    // 自定义事件
        handleClickPluginItem(action,item){
            const backItem = this.getBaseItem(item);
      // console.log('backItem',backItem)
            this.dispatch('DxbCascade', 'on-select-plugin', {action,data: backItem});
        },
        handleClickItem (item) {
            if (this.trigger !== 'click' && item.children && item.children.length) return;  // #1922
            this.handleTriggerItem(item, false, true);
        },
        handleHoverItem (item) {
            if (this.trigger !== 'hover' || !item.children || !item.children.length) return;  // #1922
            this.handleTriggerItem(item, false, true);
        },
        handleTriggerItem (item, fromInit = false, fromUser = false) {
            if (item.disabled) return;

            const cascader = findComponentUpward(this, 'DxbCascade');
            if (item.loading !== undefined && !item.children.length) {
                if (cascader && cascader.loadData) {
                    cascader.loadData(item, () => {
                        if (fromUser) {
                            cascader.isLoadedChildren = true;
                        }
                        if (item.children.length) {
                            this.handleTriggerItem(item);
                        }
                    });
                    return;
                }
            }

      // return value back recursion  // 向上递归，设置临时选中值（并非真实选中）
            const backItem = this.getBaseItem(item);
      // console.log('backItem',backItem)
      /*if (backItem.plugin){
        this.dispatch('DxbCascade', 'on-select-plugin', {backItem});
        return;
      }*/
      // #5021 for this.changeOnSelect，加 if 是因为 #4472
            if (
        this.changeOnSelect ||
        (backItem.label !== this.tmpItem.label || backItem.value !== this.tmpItem.value) ||
        (backItem.label === this.tmpItem.label && backItem.value === this.tmpItem.value)
      ) {
                this.tmpItem = backItem;
                this.emitUpdate([backItem]);
            }

            if (item.children && item.children.length){
                this.sublist = item.children;
                this.dispatch('DxbCascade', 'on-result-change', {
                    lastValue: false,
                    changeOnSelect: this.changeOnSelect,
                    fromInit: fromInit
                });

        // #1553
                if (this.changeOnSelect) {
                    const Caspanel = findComponentDownward(this, 'DxbCaspanel');
                    if (Caspanel) {
                        Caspanel.$emit('on-clear', true);
                    }
                }
            } else {
                this.sublist = [];
                this.dispatch('DxbCascade', 'on-result-change', {
                    lastValue: true,
                    changeOnSelect: this.changeOnSelect,
                    fromInit: fromInit
                });
            }

            if (cascader) {
                cascader.$refs.drop.update();
            }
        },
        updateResult (item) {
            this.result = [this.tmpItem].concat(item);
            this.emitUpdate(this.result);
        },
        getBaseItem (item) {
            let backItem = Object.assign({}, item);
            if (backItem.children) {
                delete backItem.children;
            }

            return backItem;
        },
        emitUpdate (result) {
            if (this.$parent.$options.name === 'DxbCaspanel') {
                this.$parent.updateResult(result);
            } else {
                this.$parent.$parent.updateResult(result);
            }
        },
        getKey () {
            return key++;
        }
    }
};
</script>
