import bBreadcrumb from './breadcrumb';
import bBreadcrumbItem from './breadcrumb-item';
import bBreadcrumbLink from './breadcrumb-link';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bBreadcrumb: bBreadcrumb,
  bBreadcrumbItem: bBreadcrumbItem,
  bBreadcrumbLink: bBreadcrumbLink
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;