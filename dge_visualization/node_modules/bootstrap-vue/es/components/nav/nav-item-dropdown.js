import { idMixin, dropdownMixin } from '../../mixins';

export default {
  mixins: [idMixin, dropdownMixin],
  render: function render(h) {
    var t = this;
    var button = h('a', {
      class: t.toggleClasses,
      ref: 'toggle',
      attrs: {
        href: '#',
        id: t.safeId('_BV_button_'),
        disabled: t.disabled,
        'aria-haspopup': 'true',
        'aria-expanded': t.visible ? 'true' : 'false'
      },
      on: {
        click: t.toggle,
        keydown: t.toggle // space, enter, down
      }
    }, [t.$slots['button-content'] || t.$slots.text || h('span', { domProps: { innerHTML: t.text } })]);
    var menu = h('div', {
      class: t.menuClasses,
      ref: 'menu',
      attrs: { 'aria-labelledby': t.safeId('_BV_button_') },
      on: {
        mouseover: t.onMouseOver,
        keydown: t.onKeydown // tab, up, down, esc
      }
    }, [this.$slots.default]);
    return h('li', { attrs: { id: t.safeId() }, class: t.dropdownClasses }, [button, menu]);
  },

  computed: {
    isNav: function isNav() {
      // Signal to dropdown mixin that we are in a navbar
      return true;
    },
    dropdownClasses: function dropdownClasses() {
      return ['nav-item', 'b-nav-dropdown', 'dropdown', this.dropup ? 'dropup' : '', this.visible ? 'show' : ''];
    },
    toggleClasses: function toggleClasses() {
      return ['nav-link', this.noCaret ? '' : 'dropdown-toggle', this.disabled ? 'disabled' : ''];
    },
    menuClasses: function menuClasses() {
      return ['dropdown-menu', this.right ? 'dropdown-menu-right' : 'dropdown-menu-left', this.visible ? 'show' : ''];
    }
  },
  props: {
    noCaret: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: 'menu'
    }
  }
};