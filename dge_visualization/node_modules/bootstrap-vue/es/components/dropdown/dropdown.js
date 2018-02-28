import { idMixin, dropdownMixin } from '../../mixins';
import bButton from '../button/button';

export default {
  mixins: [idMixin, dropdownMixin],
  components: { bButton: bButton },
  render: function render(h) {
    var t = this;
    var split = h(false);
    if (t.split) {
      split = h('b-button', {
        ref: 'button',
        props: {
          disabled: t.disabled,
          variant: t.variant,
          size: t.size
        },
        attrs: {
          id: t.safeId('_BV_button_')
        },
        on: {
          click: t.click
        }
      }, [t.$slots['button-content'] || t.$slots.text || t.text]);
    }
    var toggle = h('b-button', {
      ref: 'toggle',
      class: {
        'dropdown-toggle': !t.noCaret || t.split,
        'dropdown-toggle-split': t.split
      },
      props: {
        variant: t.variant,
        size: t.size,
        disabled: t.disabled
      },
      attrs: {
        id: t.safeId('_BV_toggle_'),
        'aria-haspopup': 'true',
        'aria-expanded': t.visible ? 'true' : 'false'
      },
      on: {
        click: t.toggle, // click
        keydown: t.toggle // enter, space, down
      }
    }, [t.split ? h('span', { class: ['sr-only'] }, [t.toggleText]) : t.$slots['button-content'] || t.$slots.text || t.text]);
    var menu = h('div', {
      ref: 'menu',
      class: t.menuClasses,
      attrs: {
        role: t.role,
        'aria-labelledby': t.safeId(split ? '_BV_toggle_' : '_BV_button_')
      },
      on: {
        mouseover: t.onMouseOver,
        keydown: t.onKeydown // tab, up, down, esc
      }
    }, [this.$slots.default]);
    return h('div', { attrs: { id: t.safeId() }, class: t.dropdownClasses }, [split, toggle, menu]);
  },

  props: {
    split: {
      type: Boolean,
      default: false
    },
    toggleText: {
      type: String,
      default: 'Toggle Dropdown'
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    noCaret: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: 'menu'
    }
  },
  computed: {
    dropdownClasses: function dropdownClasses() {
      return ['btn-group', 'b-dropdown', 'dropdown', this.dropup ? 'dropup' : '', this.visible ? 'show' : ''];
    },
    menuClasses: function menuClasses() {
      return ['dropdown-menu', this.right ? 'dropdown-menu-right' : '', this.visible ? 'show' : ''];
    }
  }
};