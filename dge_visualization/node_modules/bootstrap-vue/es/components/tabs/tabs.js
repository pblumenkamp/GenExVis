function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { observeDom, KeyCodes } from '../../utils';
import { idMixin } from '../../mixins';

// Helper component
var bTabButtonHelper = {
  name: 'bTabButtonHelper',
  props: {
    content: { type: String, default: '' },
    href: { type: String, default: '#' },
    posInSet: { type: Number, default: null },
    setSize: { type: Number, default: null },
    controls: { type: String, default: null },
    id: { type: String, default: null },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    linkClass: { default: null },
    itemClass: { default: null }
  },
  render: function render(h) {
    var t = this;
    var link = h('a', {
      class: ['nav-link', { active: t.active, disabled: t.disabled }, t.linkClass],
      attrs: {
        role: 'tab',
        tabindex: '-1',
        href: t.href,
        id: t.id,
        disabled: t.disabled,
        'aria-selected': t.active ? 'true' : 'false',
        'aria-setsize': t.setSize,
        'aria-posinset': t.posInSet,
        'aria-controls': t.controls
      },
      domProps: { innerHTML: t.content },
      on: {
        click: t.handleClick,
        keydown: t.handleClick
      }
    });
    return h('li', { class: ['nav-item', t.itemClass], attrs: { role: 'presentation' } }, [link]);
  },

  methods: {
    handleClick: function handleClick(evt) {
      function stop() {
        evt.preventDefault();
        evt.stopPropagation();
      }
      if (this.disabled) {
        stop();
        return;
      }
      if (evt.type === 'click' || evt.keyCode === KeyCodes.ENTER || evt.keyCode === KeyCodes.SPACE) {
        stop();
        this.$emit('click', evt);
      }
    }
  }
};

export default {
  mixins: [idMixin],
  render: function render(h) {
    var _ref;

    var t = this;
    var tabs = this.tabs;

    // Navigation 'buttons'
    var buttons = tabs.map(function (tab, index) {
      return h(bTabButtonHelper, {
        key: index,
        props: {
          content: tab.headHtml || tab.title,
          href: tab.href,
          id: tab.controlledBy || t.safeId('_BV_tab_' + (index + 1) + '_'),
          active: tab.localActive,
          disabled: tab.disabled,
          setSize: tabs.length,
          posInSet: index + 1,
          controls: t.safeId('_BV_tab_container_'),
          linkClass: tab.titleLinkClass,
          itemClass: tab.titleItemClass
        },
        on: { click: function click(evt) {
            t.setTab(index);
          } }
      });
    });

    // Nav 'button' wrapper
    var navs = h('ul', {
      class: ['nav', 'nav-' + t.navStyle, (_ref = {}, _defineProperty(_ref, 'card-header-' + t.navStyle, t.card && !t.vertical), _defineProperty(_ref, 'card-header', t.card && t.vertical), _defineProperty(_ref, 'h-100', t.card && t.vertical), _defineProperty(_ref, 'flex-column', t.vertical), _defineProperty(_ref, 'border-bottom-0', t.vertical), _defineProperty(_ref, 'rounded-0', t.vertical), _defineProperty(_ref, 'small', t.small), _ref), t.navClass],
      attrs: { role: 'tablist', tabindex: '0', id: t.safeId('_BV_tab_controls_') },
      on: { keydown: t.onKeynav }
    }, [buttons, t.$slots.tabs]);
    navs = h('div', {
      class: [{
        'card-header': t.card && !t.vertical && !(t.end || t.bottom),
        'card-footer': t.card && !t.vertical && (t.end || t.bottom),
        'col-auto': t.vertical
      }, t.navWrapperClass]
    }, [navs]);

    var empty = void 0;
    if (tabs && tabs.length) {
      empty = h(false);
    } else {
      empty = h('div', { class: ['tab-pane', 'active', { 'card-body': t.card }] }, t.$slots.empty);
    }

    // Main content section
    var content = h('div', {
      ref: 'tabsContainer',
      class: ['tab-content', { 'col': t.vertical }, t.contentClass],
      attrs: { id: t.safeId('_BV_tab_container_') }
    }, [t.$slots.default, empty]);

    // Render final output
    return h(t.tag, {
      class: ['tabs', { 'row': t.vertical, 'no-gutters': t.vertical && t.card }],
      attrs: { id: t.safeId() }
    }, [t.end || t.bottom ? content : h(false), [navs], t.end || t.bottom ? h(false) : content]);
  },
  data: function data() {
    return {
      currentTab: this.value,
      tabs: []
    };
  },

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    card: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      default: null
    },
    pills: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    bottom: {
      type: Boolean,
      default: false
    },
    end: {
      // Synonym for 'bottom'
      type: Boolean,
      default: false
    },
    noFade: {
      type: Boolean,
      default: false
    },
    lazy: {
      // This prop is sniffed by the tab child
      type: Boolean,
      default: false
    },
    contentClass: {
      type: [String, Array, Object],
      default: null
    },
    navClass: {
      type: [String, Array, Object],
      default: null
    },
    navWrapperClass: {
      type: [String, Array, Object],
      default: null
    }
  },
  watch: {
    currentTab: function currentTab(val, old) {
      if (val === old) {
        return;
      }
      this.$root.$emit('changed::tab', this, val, this.tabs[val]);
      this.$emit('input', val);
      this.tabs[val].$emit('click');
    },
    value: function value(val, old) {
      if (val === old) {
        return;
      }
      if (typeof old !== 'number') {
        old = 0;
      }
      // Moving left or right?
      var direction = val < old ? -1 : 1;
      this.setTab(val, false, direction);
    }
  },
  computed: {
    fade: function fade() {
      // This computed prop is sniffed by the tab child
      return !this.noFade;
    },
    navStyle: function navStyle() {
      return this.pills ? 'pills' : 'tabs';
    }
  },
  methods: {
    /**
         * Util: Return the sign of a number (as -1, 0, or 1)
         */
    sign: function sign(x) {
      return x === 0 ? 0 : x > 0 ? 1 : -1;
    },

    /*
         * handle keyboard navigation
         */
    onKeynav: function onKeynav(evt) {
      var key = evt.keyCode;
      var shift = evt.shiftKey;
      function stop() {
        evt.preventDefault();
        evt.stopPropagation();
      }
      if (key === KeyCodes.UP || key === KeyCodes.LEFT) {
        stop();
        if (shift) {
          this.setTab(0, false, 1);
        } else {
          this.previousTab();
        }
      } else if (key === KeyCodes.DWON || key === KeyCodes.RIGHT) {
        stop();
        if (shift) {
          this.setTab(this.tabs.length - 1, false, -1);
        } else {
          this.nextTab();
        }
      }
    },

    /**
         * Move to next tab
         */
    nextTab: function nextTab() {
      this.setTab(this.currentTab + 1, false, 1);
    },

    /**
         * Move to previous tab
         */
    previousTab: function previousTab() {
      this.setTab(this.currentTab - 1, false, -1);
    },

    /**
         * Set active tab on the tabs collection and the child 'tab' component
         * Index is the tab we want to activate. Direction is the direction we are moving
         * so if the tab we requested is disabled, we can skip over it.
         * Force is used by updateTabs to ensure we have cleared any previous active tabs.
         */
    setTab: function setTab(index, force, direction) {
      var _this = this;

      direction = this.sign(direction || 0);
      index = index || 0;
      // Prevent setting same tab and infinite loops!
      if (!force && index === this.currentTab) {
        return;
      }
      var tab = this.tabs[index];
      // Don't go beyond indexes!
      if (!tab) {
        // Reset the v-model to the current Tab
        this.$emit('input', this.currentTab);
        return;
      }
      // Ignore or Skip disabled
      if (tab.disabled) {
        if (direction) {
          // Skip to next non disabled tab in specified direction (recursive)
          this.setTab(index + direction, force, direction);
        }
        return;
      }
      // Activate requested current tab, and deactivte any old tabs
      this.tabs.forEach(function (t) {
        if (t === tab) {
          // Set new tab as active
          _this.$set(t, 'localActive', true);
        } else {
          // Ensure non current tabs are not active
          _this.$set(t, 'localActive', false);
        }
      });
      // Update currentTab
      this.currentTab = index;
    },

    /**
         * Dynamically update tabs list
         */
    updateTabs: function updateTabs() {
      // Probe tabs
      this.tabs = this.$children.filter(function (child) {
        return child._isTab;
      });
      // Set initial active tab
      var tabIndex = null;
      // Find *last* active non-dsabled tab in current tabs
      // We trust tab state over currentTab
      this.tabs.forEach(function (tab, index) {
        if (tab.localActive && !tab.disabled) {
          tabIndex = index;
        }
      });
      // Else try setting to currentTab
      if (tabIndex === null) {
        if (this.currentTab >= this.tabs.length) {
          // Handle last tab being removed
          this.setTab(this.tabs.length - 1, true, -1);
          return;
        } else if (this.tabs[this.currentTab] && !this.tabs[this.currentTab].disabled) {
          tabIndex = this.currentTab;
        }
      }
      // Else find *first* non-disabled tab in current tabs
      if (tabIndex === null) {
        this.tabs.forEach(function (tab, index) {
          if (!tab.disabled && tabIndex === null) {
            tabIndex = index;
          }
        });
      }
      this.setTab(tabIndex || 0, true, 0);
    }
  },
  mounted: function mounted() {
    this.updateTabs();
    // Observe Child changes so we can notify tabs change
    observeDom(this.$refs.tabsContainer, this.updateTabs.bind(this), { subtree: false });
  }
};