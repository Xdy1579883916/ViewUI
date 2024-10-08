<template>
  <div
    v-click-outside="handleClose"
    :class="classes"
  >
    <div
      ref="reference"
      :class="[prefixCls + '-rel']"
      @click="toggleOpen"
    >
      <input
        type="hidden"
        :name="name"
        :value="currentValue"
      >
      <slot>
        <i-input
          ref="input"
          :element-id="elementId"
          :readonly="!filterable"
          :disabled="itemDisabled"
          :value="displayInputRender"
          :size="size"
          :placeholder="inputPlaceholder"
          @on-change="handleInput"
        />
        <div
          v-show="filterable && query === ''"
          :class="[prefixCls + '-label']"
          @click="handleFocus"
        >
          {{ displayRender }}
        </div>
        <Icon
          v-show="showCloseIcon"
          type="ios-close-circle"
          :class="[prefixCls + '-arrow']"
          @click.native.stop="clearSelect"
        />
        <Icon
          :type="arrowType"
          :custom="customArrowType"
          :size="arrowSize"
          :class="[prefixCls + '-arrow']"
        />
      </slot>
    </div>
    <transition name="transition-drop">
      <Drop
        v-show="visible"
        ref="drop"
        v-transfer-dom
        :class="dropdownCls"
        :data-transfer="transfer"
        :transfer="transfer"
      >
        <div>
          <DxbCaspanel
            v-show="!filterable || (filterable && query === '')"
            ref="caspanel"
            :prefix-cls="prefixCls"
            :data="data"
            :disabled="itemDisabled"
            :change-on-select="changeOnSelect"
            :trigger="trigger"
          />
          <div
            v-show="filterable && query !== '' && querySelections.length"
            :class="[prefixCls + '-dropdown']"
          >
            <ul :class="[selectPrefixCls + '-dropdown-list']">
              <li
                v-for="(item, index) in querySelections"
                :class="[selectPrefixCls + '-item', {
                  [selectPrefixCls + '-item-disabled']: item.disabled
                }]"
                @click="handleSelectItem(index)"
                v-html="item.display"
              />
            </ul>
          </div>
          <ul
            v-show="(filterable && query !== '' && !querySelections.length) || !data.length"
            :class="[prefixCls + '-not-found-tip']"
          >
            <li>{{ localeNotFoundText }}</li>
          </ul>
        </div>
      </Drop>
    </transition>
  </div>
</template>
<script>

import iInput from '../../components/input/input.vue';
import Drop from '../../components/select/dropdown.vue';
import Icon from '../../components/icon/icon.vue';
import DxbCaspanel from './DxbCaspanel';
import clickOutside from '../../directives/clickoutside';
import TransferDom from '../../directives/transfer-dom';
import {oneOf} from '../../utils/assist';
import Emitter from '../../mixins/emitter';
import Locale from '../../mixins/locale';
import mixinsForm from '../../mixins/form';
import {clone} from 'lodash-es';

const prefixCls = 'ivu-cascader';
const selectPrefixCls = 'ivu-select';

export default {
    name: 'DxbCascade',
    components: {iInput, Drop, Icon, DxbCaspanel},
    directives: {clickOutside, TransferDom},
    mixins: [Emitter, Locale, mixinsForm],
    props: {
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        value: {
            type: Array,
            default() {
                return [];
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        clearable: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String
        },
        size: {
            validator(value) {
                return oneOf(value, ['small', 'large', 'default']);
            },
            default() {
                return !this.$IVIEW || this.$IVIEW.size === '' ? 'default' : this.$IVIEW.size;
            }
        },
        trigger: {
            validator(value) {
                return oneOf(value, ['click', 'hover']);
            },
            default: 'click'
        },
        changeOnSelect: {
            type: Boolean,
            default: false
        },
        renderFormat: {
            type: Function,
            default(label) {
                return label.join(' / ');
            }
        },
        loadData: {
            type: Function
        },
        filterable: {
            type: Boolean,
            default: false
        },
        notFoundText: {
            type: String
        },
        transfer: {
            type: Boolean,
            default() {
                return !this.$IVIEW || this.$IVIEW.transfer === '' ? false : this.$IVIEW.transfer;
            }
        },
        complete: {
            type: Boolean
        },
        name: {
            type: String
        },
        elementId: {
            type: String
        },
    // 4.0.0
        capture: {
            type: Boolean,
            default() {
                return !this.$IVIEW ? true : this.$IVIEW.capture;
            }
        },
        transferClassName: {
            type: String
        }
    },
    data() {
        return {
            prefixCls: prefixCls,
            selectPrefixCls: selectPrefixCls,
            visible: false,
            selected: [],
            tmpSelected: [],
            updatingValue: false,    // to fix set value in changeOnSelect type
            currentValue: this.value,
            query: '',
            validDataStr: '',
            isLoadedChildren: false    // #950
        };
    },
    computed: {
        classes() {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-show-clear`]: this.showCloseIcon,
                    [`${prefixCls}-size-${this.size}`]: !!this.size,
                    [`${prefixCls}-visible`]: this.visible,
                    [`${prefixCls}-disabled`]: this.itemDisabled,
                    [`${prefixCls}-not-found`]: this.filterable && this.query !== '' && !this.querySelections.length
                }
            ];
        },
        showCloseIcon() {
            return this.currentValue && this.currentValue.length && this.clearable && !this.itemDisabled;
        },
        displayRender() {
            let label = [];
            for (let i = 0; i < this.selected.length; i++) {
                label.push(this.selected[i].label);
            }

            return this.renderFormat(label, this.selected);
        },
        displayInputRender() {
            return this.filterable ? '' : this.displayRender;
        },
        localePlaceholder() {
            if (this.placeholder === undefined) {
                return this.t('i.select.placeholder');
            } else {
                return this.placeholder;
            }
        },
        inputPlaceholder() {
            return this.filterable && this.currentValue.length ? null : this.localePlaceholder;
        },
        localeNotFoundText() {
            if (this.notFoundText === undefined) {
                return this.t('i.select.noMatch');
            } else {
                return this.notFoundText;
            }
        },
        querySelections() {
            let selections = [];

            function getSelections(arr, label, value) {
                for (let i = 0; i < arr.length; i++) {
                    let item = arr[i];
                    item.__label = label ? label + ' / ' + item.label : item.label;
                    item.__value = value ? value + ',' + item.value : item.value;

                    if (item.children && item.children.length) {
                        getSelections(item.children, item.__label, item.__value);
                        delete item.__label;
                        delete item.__value;
                    } else {
                        selections.push({
                            label: item.__label,
                            value: item.__value,
                            display: item.__label,
                            item: item,
                            disabled: !!item.disabled
                        });
                    }
                }
            }

            getSelections(this.data);
            selections = selections.filter(item => {
                return item.label ? item.label.indexOf(this.query) > -1 : false;
            }).map(item => {
                item.display = item.display.replace(new RegExp(this.query, 'g'), `<span>${this.query}</span>`);
                return item;
            });
            return selections;
        },
    // 3.4.0, global setting customArrow 有值时，arrow 赋值空
        arrowType() {
            let type = 'ios-arrow-down';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.customArrow) {
                    type = '';
                } else if (this.$IVIEW.cascader.arrow) {
                    type = this.$IVIEW.cascader.arrow;
                }
            }
            return type;
        },
    // 3.4.0, global setting
        customArrowType() {
            let type = '';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.customArrow) {
                    type = this.$IVIEW.cascader.customArrow;
                }
            }
            return type;
        },
    // 3.4.0, global setting
        arrowSize() {
            let size = '';

            if (this.$IVIEW) {
                if (this.$IVIEW.cascader.arrowSize) {
                    size = this.$IVIEW.cascader.arrowSize;
                }
            }
            return size;
        },
        dropdownCls() {
            return {
                [prefixCls + '-transfer']: this.transfer,
                [this.transferClassName]: this.transferClassName
            };
        }
    },
    watch: {
        visible(val) {
            if (val) {
                if (this.currentValue.length) {
                    this.updateSelected();
                }
                if (this.transfer) {
                    this.$refs.drop.update();
                }
                this.broadcast('Drop', 'on-update-popper');
            } else {
                if (this.filterable) {
                    this.query = '';
                    this.$refs.input.currentValue = '';
                }
                if (this.transfer) {
                    this.$refs.drop.destroy();
                }
                this.broadcast('Drop', 'on-destroy-popper');
            }
            this.$emit('on-visible-change', val);
        },
        value(val) {
            this.currentValue = val;
            if (!val.length) this.selected = [];
        },
        currentValue() {
            this.$emit('input', this.currentValue);
            if (this.updatingValue) {
                this.updatingValue = false;
                return;
            }
            this.updateSelected(true);
        },
        data: {
            deep: true,
            handler() {
                const validDataStr = JSON.stringify(this.getValidData(this.data));
                if (validDataStr !== this.validDataStr) {
                    this.validDataStr = validDataStr;
                    if (!this.isLoadedChildren) {
                        this.$nextTick(() => this.updateSelected(false, this.changeOnSelect));
                    }
                    this.isLoadedChildren = false;
                }
            }
        }
    },
    created() {
        this.validDataStr = JSON.stringify(this.getValidData(this.data));
        this.$on('on-result-change', (params) => {
      // lastValue: is click the final val
      // fromInit: is this emit from update value
            const lastValue = params.lastValue;
            const changeOnSelect = params.changeOnSelect;
            const fromInit = params.fromInit;

            if (lastValue || changeOnSelect) {
                const oldVal = JSON.stringify(this.currentValue);
                this.selected = this.tmpSelected;

                let newVal = [];
                this.selected.forEach((item) => {
                    newVal.push(this.complete ? clone(item) : clone(item.value));
                });

                if (!fromInit) {
                    this.updatingValue = true;
                    this.currentValue = newVal;
                    this.emitValue(this.currentValue, oldVal);
                }
            }
            if (lastValue && !fromInit) {
                this.handleClose();
            }
        });
        this.$on('on-select-plugin', ({action,data}) => {
      // this.$emit('select-plugin',backItem)
            this.$emit(`select-${action}`,{action,data});
            this.handleClose();
        });
    },
    mounted() {
        this.updateSelected(true);
    },
    methods: {
        clearSelect() {
            if (this.itemDisabled) return false;
            const oldVal = JSON.stringify(this.currentValue);
            this.currentValue = this.selected = this.tmpSelected = [];
            this.handleClose();
            this.emitValue(this.currentValue, oldVal);
//                this.$broadcast('on-clear');
            this.broadcast('DxbCaspanel', 'on-clear');
        },
        handleClose() {
            this.visible = false;
        },
        toggleOpen() {
            if (this.itemDisabled) return false;
            if (this.visible) {
                if (!this.filterable) this.handleClose();
            } else {
                this.onFocus();
            }
        },
        onFocus() {
            this.visible = true;
            if (!this.currentValue.length) {
                this.broadcast('DxbCaspanel', 'on-clear');
            }
        },
        updateResult(result) {
            this.tmpSelected = result;
        },
        updateSelected(init = false, changeOnSelectDataChange = false) {
      // #2793 changeOnSelectDataChange used for changeOnSelect when data changed and set value
            if (!this.changeOnSelect || init || changeOnSelectDataChange) {
                this.broadcast('DxbCaspanel', 'on-find-selected', {
                    value: this.currentValue,
                    complete: this.complete
                });
            }
        },
        emitValue(val, oldVal) {
            if (JSON.stringify(val) !== oldVal) {
                this.$emit('on-change', this.currentValue, JSON.parse(JSON.stringify(this.selected)));
                this.$emit('change', this.currentValue, JSON.parse(JSON.stringify(this.selected)));
                this.$nextTick(() => {
                    this.dispatch('FormItem', 'on-form-change', {
                        value: this.currentValue,
                        selected: JSON.parse(JSON.stringify(this.selected))
                    });
                });
            }
        },
        handleInput(event) {
            this.query = event.target.value;
        },
        handleSelectItem(index) {
            const item = this.querySelections[index];

            if (item.item.disabled) return false;
            this.query = '';
            this.$refs.input.currentValue = '';
            const oldVal = JSON.stringify(this.currentValue);
            this.currentValue = item.value.split(',');
      // use setTimeout for #4786, can not use nextTick, because @on-find-selected use nextTick
            setTimeout(() => {
                this.emitValue(this.currentValue, oldVal);
                this.handleClose();
            }, 0);
        },
        handleFocus() {
            this.$refs.input.focus();
        },
    // 排除 loading 后的 data，避免重复触发 updateSelect
        getValidData(data) {
            function deleteData(item) {
                const new_item = Object.assign({}, item);
                if ('loading' in new_item) {
                    delete new_item.loading;
                }
                if ('__value' in new_item) {
                    delete new_item.__value;
                }
                if ('__label' in new_item) {
                    delete new_item.__label;
                }
                if ('children' in new_item && new_item.children.length) {
                    new_item.children = new_item.children.map(i => deleteData(i));
                }
                return new_item;
            }

            return data.map(item => deleteData(item));
        },

    }
};
</script>
