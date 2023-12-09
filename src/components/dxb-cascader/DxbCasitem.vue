<template>
  <li :class="[...classes,'DxbCasitem']">
    <!--  plugin  -->
    <div
      v-if="data.plugin"
      @click.stop="$emit('handleClickPluginItem','plugin')"
    >
      <render-item
        v-if="data.render"
        :render="data.render"
      />
      <div
        v-else
        :class="['plugin', ...data.class]"
      >
        <DxbIcon
          name="iconzengjia"
          class="mr10"
        />{{ data.label }}
      </div>
    </div>
    <!--  default  -->
    <div
      v-else
      @click.stop="$emit('handleClickItem')"
    >
      <!--  前缀slot preSlot  -->
      <span
        v-if="data.preSlot"
        @click.stop="$emit('handleClickPluginItem','pre')"
      >
        <render-item :render="data.preSlot"/>
      </span>
      {{ data.label }}
      <!--  后缀slot sufSlot  -->
      <span
        v-if="data.sufSlot"
        @click.stop="$emit('handleClickPluginItem','suf')"
      >
        <render-item :render="data.sufSlot"/>
      </span>
      <Icon
        v-if="showArrow"
        :type="arrowType"
        :custom="customArrowType"
        :size="arrowSize"
      />
      <i
        v-if="showLoading"
        class="ivu-icon ivu-icon-ios-loading ivu-load-loop ivu-cascader-menu-item-loading"
      />
    </div>
  </li>
</template>
<script>
import Icon from '../../components/icon/icon.vue';
import renderItem from './renderItem';

export default {
    name: 'DxbCasitem',
    components: { Icon,renderItem },
    props: {
        data: Object,
        prefixCls: String,
        tmpItem: Object
    },
    computed: {
        classes () {
            return [
                `${this.prefixCls}-menu-item`,
                {
                    [`${this.prefixCls}-menu-item-active`]: this.tmpItem.value === this.data.value,
                    [`${this.prefixCls}-menu-item-disabled`]: this.data.disabled
                }
            ];
        },
        showArrow () {
            return (this.data.children && this.data.children.length) || ('loading' in this.data && !this.data.loading);
        },
        showLoading () {
            return 'loading' in this.data && this.data.loading;
        },
    // 3.4.0, global setting customArrow 有值时，arrow 赋值空
        arrowType () {
            let type = 'ios-arrow-forward';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.customItemArrow) {
                    type = '';
                } else if (this.$IVIEW.cascader.itemArrow) {
                    type = this.$IVIEW.cascader.itemArrow;
                }
            }
            return type;
        },
    // 3.4.0, global setting
        customArrowType () {
            let type = '';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.customItemArrow) {
                    type = this.$IVIEW.cascader.customItemArrow;
                }
            }
            return type;
        },
    // 3.4.0, global setting
        arrowSize () {
            let size = '';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.itemArrowSize) {
                    size = this.$IVIEW.cascader.itemArrowSize;
                }
            }
            return size;
        }
    }
};
</script>
