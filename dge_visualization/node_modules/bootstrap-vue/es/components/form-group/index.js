import bFormGroup from './form-group';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bFormGroup: bFormGroup,
  bFormFieldset: bFormGroup
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;