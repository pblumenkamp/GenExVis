import bPaginationNav from './pagination-nav';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bPaginationNav: bPaginationNav
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;