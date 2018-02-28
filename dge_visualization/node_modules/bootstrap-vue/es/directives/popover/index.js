import bPopover from './popover';
import { registerDirectives, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var directives = {
  bPopover: bPopover
};

var VuePlugin = {
  install: function install(Vue) {
    registerDirectives(Vue, directives);
  }
};

vueUse(VuePlugin);

export default VuePlugin;