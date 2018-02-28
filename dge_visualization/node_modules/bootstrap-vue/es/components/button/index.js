import bButton from './button';
import bButtonClose from './button-close';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bButton: bButton,
  bBtn: bButton,
  bButtonClose: bButtonClose,
  bBtnClose: bButtonClose
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;