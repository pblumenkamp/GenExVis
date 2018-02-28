import bCarousel from './carousel';
import bCarouselSlide from './carousel-slide';
import { registerComponents, vueUse } from '../../utils';

/* eslint-disable no-var, no-undef, guard-for-in, object-shorthand */

var components = {
  bCarousel: bCarousel,
  bCarouselSlide: bCarouselSlide
};

var VuePlugin = {
  install: function install(Vue) {
    registerComponents(Vue, components);
  }
};

vueUse(VuePlugin);

export default VuePlugin;