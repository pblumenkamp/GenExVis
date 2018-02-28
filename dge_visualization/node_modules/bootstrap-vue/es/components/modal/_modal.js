function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import bBtn from '../button/button';
import bBtnClose from '../button/button-close';
import { idMixin, listenOnRootMixin } from '../../mixins';
import { observeDom, warn, KeyCodes } from '../../utils';
import BvEvent from '../../utils/bv-event.class';

import { isVisible, selectAll, select, getBCR, addClass, removeClass, hasClass, setAttr, removeAttr, getAttr, hasAttr, eventOn, eventOff } from '../../utils/dom';

// Selectors for padding/margin adjustments
var Selector = {
  FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
  STICKY_CONTENT: '.sticky-top',
  NAVBAR_TOGGLER: '.navbar-toggler'

  // ObserveDom config
};var OBSERVER_CONFIG = {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: ['style', 'class']
};

export default {
  mixins: [idMixin, listenOnRootMixin],
  components: { bBtn: bBtn, bBtnClose: bBtnClose },
  render: function render(h) {
    var t = this;
    var $slots = t.$slots;
    // Modal Header
    var header = h(false);
    if (!t.hideHeader) {
      var modalHeader = $slots['modal-header'];
      if (!modalHeader) {
        var closeButton = h(false);
        if (!t.hideHeaderClose) {
          closeButton = h('b-btn-close', {
            props: {
              disabled: t.is_transitioning,
              ariaLabel: t.headerCloseLabel,
              textVariant: t.headerTextVariant
            },
            on: { click: function click(evt) {
                t.hide('header-close');
              } }
          }, [$slots['modal-header-close']]);
        }
        modalHeader = [h(t.titleTag, { class: ['modal-title'] }, [$slots['modal-title'] || t.title]), closeButton];
      }
      header = h('header', {
        ref: 'header',
        class: t.headerClasses,
        attrs: { id: t.safeId('__BV_modal_header_') }
      }, [modalHeader]);
    }
    // Modal Body
    var body = h('div', {
      ref: 'body',
      class: t.bodyClasses,
      attrs: { id: t.safeId('__BV_modal_body_') }
    }, [$slots.default]);
    // Modal Footer
    var footer = h(false);
    if (!t.hideFooter) {
      var modalFooter = $slots['modal-footer'];
      if (!modalFooter) {
        var okButton = h(false);
        if (!t.okOnly) {
          okButton = h('b-btn', {
            props: {
              variant: t.cancelVariant,
              size: t.buttonSize,
              disabled: t.cancelDisabled || t.busy || t.is_transitioning
            },
            on: { click: function click(evt) {
                t.hide('cancel');
              } }
          }, [$slots['modal-cancel'] || t.cancelTitle]);
        }
        var cancelButton = h('b-btn', {
          props: {
            variant: t.okVariant,
            size: t.buttonSize,
            disabled: t.okDisabled || t.busy || t.is_transitioning
          },
          on: { click: function click(evt) {
              t.hide('ok');
            } }
        }, [$slots['modal-ok'] || t.okTitle]);
        modalFooter = [cancelButton, okButton];
      }
      footer = h('footer', {
        ref: 'footer',
        class: t.footerClasses,
        attrs: { id: t.safeId('__BV_modal_footer_') }
      }, [modalFooter]);
    }
    // Assemble Modal Content
    var modalContent = h('div', {
      ref: 'content',
      class: ['modal-content'],
      attrs: {
        tabindex: '-1',
        role: 'document',
        'aria-labelledby': t.hideHeader ? null : t.safeId('__BV_modal_header_'),
        'aria-describedby': t.safeId('__BV_modal_body_')
      },
      on: {
        focusout: t.onFocusout,
        click: function click(evt) {
          evt.stopPropagation();
        }
      }
    }, [header, body, footer]);
    // Modal Dialog wrapper
    var modalDialog = h('div', { class: t.dialogClasses }, [modalContent]);
    // Modal
    var modal = h('div', {
      ref: 'modal',
      class: t.modalClasses,
      directives: [{ name: 'show', rawName: 'v-show', value: t.is_visible, expression: 'is_visible' }],
      attrs: {
        id: t.safeId(),
        role: 'dialog',
        'aria-hidden': t.is_visible ? null : 'true'
      },
      on: {
        click: t.onClickOut,
        keydown: t.onEsc
      }
    }, [modalDialog]);
    // Wrap modal in transition
    modal = h('transition', {
      props: {
        enterClass: '',
        enterToClass: '',
        enterActiveClass: '',
        leaveClass: '',
        leaveActiveClass: '',
        leaveToClass: ''
      },
      on: {
        'before-enter': t.onBeforeEnter,
        'enter': t.onEnter,
        'after-enter': t.onAfterEnter,
        'before-leave': t.onBeforeLeave,
        'leave': t.onLeave,
        'after-leave': t.onAfterLeave
      }
    }, [modal]);
    // Modal Backdrop
    var backdrop = h(false);
    if (!t.hideBackdrop && (t.is_visible || t.is_transitioning)) {
      backdrop = h('div', { class: t.backdropClasses, attrs: { id: t.safeId('__BV_modal_backdrop_') } });
    }
    // Assemble modal and backdrop
    var outer = h(false);
    if (!t.is_hidden) {
      outer = h('div', { attrs: { id: t.safeId('__BV_modal_outer_') } }, [modal, backdrop]);
    }
    // Wrap in DIV to maintain thi.$el reference for hide/show method aceess
    return h('div', {}, [outer]);
  },
  data: function data() {
    return {
      is_hidden: this.lazy || false,
      is_visible: false,
      is_transitioning: false,
      is_show: false,
      is_block: false,
      scrollbarWidth: 0,
      isBodyOverflowing: false,
      return_focus: this.returnFocus || null
    };
  },

  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    titleTag: {
      type: String,
      default: 'h5'
    },
    size: {
      type: String,
      default: 'md'
    },
    centered: {
      type: Boolean,
      default: false
    },
    buttonSize: {
      type: String,
      default: ''
    },
    noFade: {
      type: Boolean,
      default: false
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: false
    },
    noCloseOnEsc: {
      type: Boolean,
      default: false
    },
    noEnforceFocus: {
      type: Boolean,
      default: false
    },
    headerBgVariant: {
      type: String,
      default: null
    },
    headerBorderVariant: {
      type: String,
      default: null
    },
    headerTextVariant: {
      type: String,
      default: null
    },
    bodyBgVariant: {
      type: String,
      default: null
    },
    bodyTextVariant: {
      type: String,
      default: null
    },
    footerBgVariant: {
      type: String,
      default: null
    },
    footerBorderVariant: {
      type: String,
      default: null
    },
    footerTextVariant: {
      type: String,
      default: null
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    hideHeaderClose: {
      type: Boolean,
      default: false
    },
    hideBackdrop: {
      type: Boolean,
      default: false
    },
    okOnly: {
      type: Boolean,
      default: false
    },
    okDisabled: {
      type: Boolean,
      default: false
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    returnFocus: {
      default: null
    },
    headerCloseLabel: {
      type: String,
      default: 'Close'
    },
    cancelTitle: {
      type: String,
      default: 'Cancel'
    },
    okTitle: {
      type: String,
      default: 'OK'
    },
    cancelVariant: {
      type: String,
      default: 'secondary'
    },
    okVariant: {
      type: String,
      default: 'primary'
    },
    lazy: {
      type: Boolean,
      default: false
    },
    busy: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    modalClasses: function modalClasses() {
      return ['modal', {
        fade: !this.noFade,
        show: this.is_show,
        'd-block': this.is_block
      }];
    },
    dialogClasses: function dialogClasses() {
      var _ref;

      return ['modal-dialog', (_ref = {}, _defineProperty(_ref, 'modal-' + this.size, Boolean(this.size)), _defineProperty(_ref, 'modal-dialog-centered', this.centered), _ref)];
    },
    backdropClasses: function backdropClasses() {
      return ['modal-backdrop', {
        fade: !this.noFade,
        show: this.is_show || this.noFade
      }];
    },
    headerClasses: function headerClasses() {
      var _ref2;

      return ['modal-header', (_ref2 = {
        'rounded-top': Boolean(this.headerBgVariant)
      }, _defineProperty(_ref2, 'bg-' + this.headerBgVariant, Boolean(this.headerBgVariant)), _defineProperty(_ref2, 'text-' + this.headerTextVariant, Boolean(this.headerTextVariant)), _defineProperty(_ref2, 'border-' + this.headerBorderVariant, Boolean(this.headerBorderVariant)), _ref2)];
    },
    bodyClasses: function bodyClasses() {
      var _ref3;

      return ['modal-body', (_ref3 = {}, _defineProperty(_ref3, 'bg-' + this.bodyBgVariant, Boolean(this.bodyBgVariant)), _defineProperty(_ref3, 'text-' + this.bodyTextVariant, Boolean(this.bodyTextVariant)), _ref3)];
    },
    footerClasses: function footerClasses() {
      var _ref4;

      return ['modal-footer', (_ref4 = {
        'rounded-bottom': Boolean(this.footerBgVariant)
      }, _defineProperty(_ref4, 'bg-' + this.footerBgVariant, Boolean(this.footerBgVariant)), _defineProperty(_ref4, 'text-' + this.footerTextVariant, Boolean(this.footerTextVariant)), _defineProperty(_ref4, 'border-' + this.footerBorderVariant, Boolean(this.footerBorderVariant)), _ref4)];
    }
  },
  watch: {
    visible: function visible(newVal, oldVal) {
      if (newVal === oldVal) {
        return;
      }
      this[newVal ? 'show' : 'hide']();
    }
  },
  methods: {
    // Public Methods
    show: function show() {
      if (this.is_visible) {
        return;
      }
      var showEvt = new BvEvent('show', {
        cancelable: true,
        vueTarget: this,
        target: this.$refs.modal,
        relatedTarget: null
      });
      this.emitEvent(showEvt);
      if (showEvt.defaultPrevented || this.is_visible) {
        // Don't show if canceled
        return;
      }
      if (hasClass(document.body, 'modal-open')) {
        // If another modal is already open, wait for it to close
        this.$root.$once('bv::modal::hidden', this.doShow);
      } else {
        // Show the modal
        this.doShow();
      }
    },
    hide: function hide(trigger) {
      if (!this.is_visible) {
        return;
      }
      var hideEvt = new BvEvent('hide', {
        cancelable: true,
        vueTarget: this,
        target: this.$refs.modal,
        // this could be the trigger element/component reference
        relatedTarget: null,
        isOK: trigger || null,
        trigger: trigger || null,
        cancel: function cancel() {
          // Backwards compatibility
          warn('b-modal: evt.cancel() is deprecated. Please use evt.preventDefault().');
          this.preventDefault();
        }
      });
      if (trigger === 'ok') {
        this.$emit('ok', hideEvt);
      } else if (trigger === 'cancel') {
        this.$emit('cancel', hideEvt);
      }
      this.emitEvent(hideEvt);
      // Hide if not canceled
      if (hideEvt.defaultPrevented || !this.is_visible) {
        return;
      }
      // stop observing for content changes
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      this.is_visible = false;
      this.$emit('change', false);
    },

    // Private method to finish showing modal
    doShow: function doShow() {
      var _this = this;

      // Plce modal in DOM if lazy
      this.is_hidden = false;
      this.$nextTick(function () {
        // We do this in nextTick to ensure the modal is in DOM first before we show it
        _this.is_visible = true;
        _this.$emit('change', true);
        // Observe changes in modal content and adjust if necessary
        _this._observer = observeDom(_this.$refs.content, _this.adjustDialog.bind(_this), OBSERVER_CONFIG);
      });
    },

    // Transition Handlers
    onBeforeEnter: function onBeforeEnter() {
      this.is_transitioning = true;
      this.checkScrollbar();
      this.setScrollbar();
      this.adjustDialog();
      addClass(document.body, 'modal-open');
      this.setResizeEvent(true);
    },
    onEnter: function onEnter() {
      this.is_block = true;
      this.$refs.modal.scrollTop = 0;
    },
    onAfterEnter: function onAfterEnter() {
      var _this2 = this;

      this.is_show = true;
      this.is_transitioning = false;
      this.$nextTick(function () {
        _this2.focusFirst();
        var shownEvt = new BvEvent('shown', {
          cancelable: false,
          vueTarget: _this2,
          target: _this2.$refs.modal,
          relatedTarget: null
        });
        _this2.emitEvent(shownEvt);
      });
    },
    onBeforeLeave: function onBeforeLeave() {
      this.is_transitioning = true;
      this.setResizeEvent(false);
    },
    onLeave: function onLeave() {
      // Remove the 'show' class
      this.is_show = false;
    },
    onAfterLeave: function onAfterLeave() {
      var _this3 = this;

      this.is_block = false;
      this.resetAdjustments();
      this.resetScrollbar();
      this.is_transitioning = false;
      removeClass(document.body, 'modal-open');
      this.$nextTick(function () {
        _this3.is_hidden = _this3.lazy || false;
        _this3.returnFocusTo();
        var hiddenEvt = new BvEvent('hidden', {
          cancelable: false,
          vueTarget: _this3,
          target: _this3.lazy ? null : _this3.$refs.modal,
          relatedTarget: null
        });
        _this3.emitEvent(hiddenEvt);
      });
    },

    // Event emitter
    emitEvent: function emitEvent(bvEvt) {
      var type = bvEvt.type;
      this.$emit(type, bvEvt);
      this.$root.$emit('bv::modal::' + type, bvEvt);
    },

    // UI Event Handlers
    onClickOut: function onClickOut(evt) {
      // If backdrop clicked, hide modal
      if (this.is_visible && !this.noCloseOnBackdrop) {
        this.hide('backdrop');
      }
    },
    onEsc: function onEsc(evt) {
      // If ESC pressed, hide modal
      if (evt.keyCode === KeyCodes.ESC && this.is_visible && !this.noCloseOnEsc) {
        this.hide('esc');
      }
    },
    onFocusout: function onFocusout(evt) {
      // If focus leaves modal, bring it back
      // 'focusout' Event Listener bound on content
      var content = this.$refs.content;
      if (!this.noEnforceFocus && this.is_visible && content && !content.contains(evt.relatedTarget)) {
        content.focus();
      }
    },

    // Resize Listener
    setResizeEvent: function setResizeEvent(on) {
      var _this4 = this;

      ['resize', 'orientationchange'].forEach(function (evtName) {
        if (on) {
          eventOn(window, evtName, _this4.adjustDialog);
        } else {
          eventOff(window, evtName, _this4.adjustDialog);
        }
      });
    },

    // Root Listener handlers
    showHandler: function showHandler(id, triggerEl) {
      if (id === this.id) {
        this.return_focus = triggerEl || null;
        this.show();
      }
    },
    hideHandler: function hideHandler(id) {
      if (id === this.id) {
        this.hide();
      }
    },
    modalListener: function modalListener(bvEvt) {
      // If another modal opens, close this one
      if (bvEvt.vueTarget !== this) {
        this.hide();
      }
    },

    // Focus control handlers
    focusFirst: function focusFirst() {
      // Don't try and focus if we are SSR
      if (typeof document === 'undefined') {
        return;
      }
      var content = this.$refs.content;
      var modal = this.$refs.modal;
      var activeElement = document.activeElement;
      if (activeElement && content && content.contains(activeElement)) {
        // If activeElement is child of content, no need to change focus
      } else if (content) {
        if (modal) {
          modal.scrollTop = 0;
        }
        // Focus the modal content wrapper
        content.focus();
      }
    },
    returnFocusTo: function returnFocusTo() {
      // Prefer returnFocus prop over event specified return_focus value
      var el = this.returnFocus || this.return_focus || null;
      if (typeof el === 'string') {
        // CSS Selector
        el = select(el);
      }
      if (el) {
        el = el.$el || el;
        if (isVisible(el)) {
          el.focus();
        }
      }
    },

    // Utility methods
    getScrollbarWidth: function getScrollbarWidth() {
      var scrollDiv = document.createElement('div');
      scrollDiv.className = 'modal-scrollbar-measure';
      document.body.appendChild(scrollDiv);
      this.scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    },
    adjustDialog: function adjustDialog() {
      if (!this.is_visible) {
        return;
      }
      var modal = this.$refs.modal;
      var isModalOverflowing = modal.scrollHeight > document.documentElement.clientHeight;
      if (!this.isBodyOverflowing && isModalOverflowing) {
        modal.style.paddingLeft = this.scrollbarWidth + 'px';
      }
      if (this.isBodyOverflowing && !isModalOverflowing) {
        modal.style.paddingRight = this.scrollbarWidth + 'px';
      }
    },
    resetAdjustments: function resetAdjustments() {
      var modal = this.$refs.modal;
      if (modal) {
        modal.style.paddingLeft = '';
        modal.style.paddingRight = '';
      }
    },
    checkScrollbar: function checkScrollbar() {
      var rect = getBCR(document.body);
      this.isBodyOverflowing = rect.left + rect.right < window.innerWidth;
    },
    setScrollbar: function setScrollbar() {
      if (this.isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
        var computedStyle = window.getComputedStyle;
        var body = document.body;
        var scrollbarWidth = this.scrollbarWidth;
        // Adjust fixed content padding
        selectAll(Selector.FIXED_CONTENT).forEach(function (el) {
          var actualPadding = el.style.paddingRight;
          var calculatedPadding = computedStyle(el).paddingRight || 0;
          setAttr(el, 'data-padding-right', actualPadding);
          el.style.paddingRight = parseFloat(calculatedPadding) + scrollbarWidth + 'px';
        });
        // Adjust sticky content margin
        selectAll(Selector.STICKY_CONTENT).forEach(function (el) {
          var actualMargin = el.style.marginRight;
          var calculatedMargin = computedStyle(el).marginRight || 0;
          setAttr(el, 'data-margin-right', actualMargin);
          el.style.marginRight = parseFloat(calculatedMargin) - scrollbarWidth + 'px';
        });
        // Adjust navbar-toggler margin
        selectAll(Selector.NAVBAR_TOGGLER).forEach(function (el) {
          var actualMargin = el.style.marginRight;
          var calculatedMargin = computedStyle(el).marginRight || 0;
          setAttr(el, 'data-margin-right', actualMargin);
          el.style.marginRight = parseFloat(calculatedMargin) + scrollbarWidth + 'px';
        });
        // Adjust body padding
        var actualPadding = body.style.paddingRight;
        var calculatedPadding = computedStyle(body).paddingRight;
        setAttr(body, 'data-padding-right', actualPadding);
        body.style.paddingRight = parseFloat(calculatedPadding) + scrollbarWidth + 'px';
      }
    },
    resetScrollbar: function resetScrollbar() {
      // Restore fixed content padding
      selectAll(Selector.FIXED_CONTENT).forEach(function (el) {
        if (hasAttr(el, 'data-padding-right')) {
          el.style.paddingRight = getAttr(el, 'data-padding-right') || '';
          removeAttr(el, 'data-padding-right');
        }
      });
      // Restore sticky content and navbar-toggler margin
      selectAll(Selector.STICKY_CONTENT + ', ' + Selector.NAVBAR_TOGGLER).forEach(function (el) {
        if (hasAttr(el, 'data-margin-right')) {
          el.style.marginRight = getAttr(el, 'data-margin-right') || '';
          removeAttr(el, 'data-margin-right');
        }
      });
      // Restore body padding
      var body = document.body;
      if (hasAttr(body, 'data-padding-right')) {
        body.style.paddingRight = getAttr(body, 'data-padding-right') || '';
        removeAttr(body, 'data-padding-right');
      }
    }
  },
  created: function created() {
    // create non-reactive property
    this._observer = null;
  },
  mounted: function mounted() {
    // Measure scrollbar
    this.getScrollbarWidth();
    // Listen for events from others to either open or close ourselves
    this.listenOnRoot('bv::show::modal', this.showHandler);
    this.listenOnRoot('bv::hide::modal', this.hideHandler);
    // Listen for bv:modal::show events, and close ourselves if the opening modal not us
    this.listenOnRoot('bv::modal::show', this.modalListener);
    // Initially show modal?
    if (this.visible === true) {
      this.show();
    }
  },
  beforeDestroy: function beforeDestroy() {
    // Ensure everything is back to normal
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this.setResizeEvent(false);
    // Re-adjust body/navbar/fixed padding/margins (if needed)
    removeClass(document.body, 'modal-open');
    this.resetAdjustments();
    this.resetScrollbar();
  }
};