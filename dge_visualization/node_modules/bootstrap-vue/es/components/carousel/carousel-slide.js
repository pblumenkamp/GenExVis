import bImg from '../image/img';
import { warn } from '../../utils';
import { idMixin } from '../../mixins';

export default {
  components: { bImg: bImg },
  mixins: [idMixin],
  render: function render(h) {
    var t = this;
    var $slots = t.$slots;

    var img = $slots.img;
    if (!img && (t.imgSrc || t.imgBlank)) {
      img = h('b-img', {
        props: {
          fluidGrow: true,
          block: true,
          src: t.imgSrc,
          blank: t.imgBlank,
          blankColor: t.imgBlankColor,
          width: t.computedWidth,
          height: t.computedHeight,
          alt: t.imgAlt
        }
      });
    }

    var content = h(t.contentTag, { class: t.contentClasses }, [t.caption ? h(t.captionTag, { domProps: { innerHTML: t.caption } }) : h(false), t.text ? h(t.textTag, { domProps: { innerHTML: t.text } }) : h(false), $slots.default]);

    return h('div', {
      class: ['carousel-item'],
      style: { background: t.background },
      attrs: { id: t.safeId(), role: 'listitem' }
    }, [img, content]);
  },

  props: {
    imgSrc: {
      type: String,
      default: function _default() {
        if (this && this.src) {
          // Deprecate src
          warn("b-carousel-slide: prop 'src' has been deprecated. Use 'img-src' instead");
          return this.src;
        }
        return null;
      }
    },
    src: {
      // Deprecated: use img-src instead
      type: String
    },
    imgAlt: {
      type: String
    },
    imgWidth: {
      type: [Number, String]
    },
    imgHeight: {
      type: [Number, String]
    },
    imgBlank: {
      type: Boolean,
      default: false
    },
    imgBlankColor: {
      type: String,
      default: 'transparent'
    },
    contentVisibleUp: {
      type: String
    },
    contentTag: {
      type: String,
      default: 'div'
    },
    caption: {
      type: String
    },
    captionTag: {
      type: String,
      default: 'h3'
    },
    text: {
      type: String
    },
    textTag: {
      type: String,
      default: 'p'
    },
    background: {
      type: String
    }
  },
  computed: {
    contentClasses: function contentClasses() {
      return ['carousel-caption', this.contentVisibleUp ? 'd-none' : '', this.contentVisibleUp ? 'd-' + this.contentVisibleUp + '-block' : ''];
    },
    computedWidth: function computedWidth() {
      // Use local width, or try parent width
      return this.imgWidth || this.$parent.imgWidth;
    },
    computedHeight: function computedHeight() {
      // Use local height, or try parent height
      return this.imgHeight || this.$parent.imgHeight;
    }
  }
};