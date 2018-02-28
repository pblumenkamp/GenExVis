import bFormRadio from './form-radio';
import bFormRadioGroup from './form-radio-group';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bFormRadio: bFormRadio,
  bRadio: bFormRadio,
  bFormRadioGroup: bFormRadioGroup,
  bRadioGroup: bFormRadioGroup
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;