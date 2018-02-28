import { observeDom, KeyCodes } from '../../utils';
import { selectAll, reflow, addClass, removeClass, setAttr, eventOn, eventOff } from '../../utils/dom';
import { idMixin } from '../../mixins';

// Slide directional classes
var DIRECTION = {
  next: {
    dirClass: 'carousel-item-left',
    overlayClass: 'carousel-item-next'
  },
  prev: {
    dirClass: 'carousel-item-right',
    overlayClass: 'carousel-item-prev'
  }

  // Fallback Transition duration (with a little buffer) in ms
};var TRANS_DURATION = 600 + 50;

// Transition Event names
var TransitionEndEvents = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'otransitionend oTransitionEnd',
  transition: 'transitionend'

  // Return the browser specific transitionend event name
};function getTransisionEndEvent(el) {
  for (var name in TransitionEndEvents) {
    if (el.style[name] !== undefined) {
      return TransitionEndEvents[name];
    }
  }
  // fallback
  return null;
}

export default {
  mixins: [idMixin],
  render: function render(h) {
    var t = this;

    // Wrapper for slides
    var inner = h('div', {
      ref: 'inner',
      class: ['carousel-inner'],
      attrs: {
        id: t.safeId('__BV_inner_'),
        role: 'list'
      }
    }, [t.$slots.default]);

    // Prev and Next Controls
    var controls = h(false);
    if (t.controls) {
      controls = [h('a', {
        class: ['carousel-control-prev'],
        attrs: { href: '#', role: 'button', 'aria-controls': t.safeId('__BV_inner_') },
        on: {
          click: function click(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            t.prev();
          },
          keydown: function keydown(evt) {
            var keyCode = evt.keyCode;
            if (keyCode === KeyCodes.SPACE || keyCode === KeyCodes.ENTER) {
              evt.preventDefault();
              evt.stopPropagation();
              t.prev();
            }
          }
        }
      }, [h('span', { class: ['carousel-control-prev-icon'], attrs: { 'aria-hidden': 'true' } }), h('span', { class: ['sr-only'] }, [t.labelPrev])]), h('a', {
        class: ['carousel-control-next'],
        attrs: { href: '#', role: 'button', 'aria-controls': t.safeId('__BV_inner_') },
        on: {
          click: function click(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            t.next();
          },
          keydown: function keydown(evt) {
            var keyCode = evt.keyCode;
            if (keyCode === KeyCodes.SPACE || keyCode === KeyCodes.ENTER) {
              evt.preventDefault();
              evt.stopPropagation();
              t.next();
            }
          }
        }
      }, [h('span', { class: ['carousel-control-next-icon'], attrs: { 'aria-hidden': 'true' } }), h('span', { class: ['sr-only'] }, [t.labelNext])])];
    }

    // Indicators
    var indicators = h('ol', {
      class: ['carousel-indicators'],
      directives: [{ name: 'show', rawName: 'v-show', value: t.indicators, expression: 'indicators' }],
      attrs: {
        id: t.safeId('__BV_indicators_'),
        'aria-hidden': t.indicators ? 'false' : 'true',
        'aria-label': t.labelIndicators,
        'aria-owns': t.safeId('__BV_inner_')
      }
    }, t.slides.map(function (slide, n) {
      return h('li', {
        key: 'slide_' + n,
        class: { active: n === t.index },
        attrs: {
          role: 'button',
          id: t.safeId('__BV_indicator_' + (n + 1) + '_'),
          tabindex: t.indicators ? '0' : '-1',
          'aria-current': n === t.index ? 'true' : 'false',
          'aria-label': t.labelGotoSlide + ' ' + (n + 1),
          'aria-describedby': t.slides[n].id || null,
          'aria-controls': t.safeId('__BV_inner_')
        },
        on: {
          click: function click(evt) {
            t.setSlide(n);
          },
          keydown: function keydown(evt) {
            var keyCode = evt.keyCode;
            if (keyCode === KeyCodes.SPACE || keyCode === KeyCodes.ENTER) {
              evt.preventDefault();
              evt.stopPropagation();
              t.setSlide(n);
            }
          }
        }
      });
    }));

    // Return the carousel
    return h('div', {
      class: ['carousel', 'slide'],
      style: { background: t.background },
      attrs: {
        role: 'region',
        id: t.safeId(),
        'aria-busy': t.isSliding ? 'true' : 'false'
      },
      on: {
        mouseenter: t.pause,
        mouseleave: t.restart,
        focusin: t.pause,
        focusout: t.restart,
        keydown: function keydown(evt) {
          var keyCode = evt.keyCode;
          if (keyCode === KeyCodes.LEFT || keyCode === KeyCodes.RIGHT) {
            evt.preventDefault();
            evt.stopPropagation();
            t[keyCode === KeyCodes.LEFT ? 'prev' : 'next']();
          }
        }
      }
    }, [inner, controls, indicators]);
  },
  data: function data() {
    return {
      index: this.value || 0,
      isSliding: false,
      intervalId: null,
      transitionEndEvent: null,
      slides: []
    };
  },

  props: {
    labelPrev: {
      type: String,
      default: 'Previous Slide'
    },
    labelNext: {
      type: String,
      default: 'Next Slide'
    },
    labelGotoSlide: {
      type: String,
      default: 'Goto Slide'
    },
    labelIndicators: {
      type: String,
      default: 'Select a slide to display'
    },
    interval: {
      type: Number,
      default: 5000
    },
    indicators: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: false
    },
    imgWidth: {
      // Sniffed by carousel-slide
      type: [Number, String]
    },
    imgHeight: {
      // Sniffed by carousel-slide
      type: [Number, String]
    },
    background: {
      type: String
    },
    value: {
      type: Number,
      default: 0
    }
  },
  computed: {
    isCycling: function isCycling() {
      return Boolean(this.intervalId);
    }
  },
  methods: {
    // Set slide
    setSlide: function setSlide(slide) {
      var _this = this;

      // Don't animate when page is not visible
      if (typeof document !== 'undefined' && document.visibilityState && document.hidden) {
        return;
      }
      var len = this.slides.length;
      // Don't do anything if nothing to slide to
      if (len === 0) {
        return;
      }
      // Don't change slide while transitioning, wait until transition is done
      if (this.isSliding) {
        // Schedule slide after sliding complete
        this.$once('sliding-end', function () {
          return _this.setSlide(slide);
        });
        return;
      }
      // Make sure we have an integer (you never know!)
      slide = Math.floor(slide);
      // Set new slide index. Wrap around if necessary
      this.index = slide >= len ? 0 : slide >= 0 ? slide : len - 1;
    },

    // Previous slide
    prev: function prev() {
      this.setSlide(this.index - 1);
    },

    // Next slide
    next: function next() {
      this.setSlide(this.index + 1);
    },

    // Pause auto rotation
    pause: function pause() {
      if (this.isCycling) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        if (this.slides[this.index]) {
          // Make current slide focusable for screen readers
          this.slides[this.index].tabIndex = 0;
        }
      }
    },

    // Start auto rotate slides
    start: function start() {
      var _this2 = this;

      // Don't start if no intetrval, or if we are already running
      if (!this.interval || this.isCycling) {
        return;
      }
      this.slides.forEach(function (slide) {
        slide.tabIndex = -1;
      });
      this.intervalId = setInterval(function () {
        _this2.next();
      }, Math.max(1000, this.interval));
    },

    // Re-Start auto rotate slides when focus/hover leaves the carousel
    restart: function restart(evt) {
      if (!this.$el.contains(document.activeElement)) {
        this.start();
      }
    },

    // Update slide list
    updateSlides: function updateSlides() {
      var _this3 = this;

      this.pause();
      // Get all slides as DOM elements
      this.slides = selectAll('.carousel-item', this.$refs.inner);
      var numSlides = this.slides.length;
      // Keep slide number in range
      var index = Math.max(0, Math.min(Math.floor(this.index), numSlides - 1));
      this.slides.forEach(function (slide, idx) {
        var n = idx + 1;
        var id = _this3.safeId('__BV_indicator_' + n + '_');
        if (idx === index) {
          addClass(slide, 'active');
        } else {
          removeClass(slide, 'active');
        }
        setAttr(slide, 'aria-current', idx === index ? 'true' : 'false');
        setAttr(slide, 'aria-posinset', String(n));
        setAttr(slide, 'aria-setsize', String(numSlides));
        slide.tabIndex = -1;
        if (id) {
          setAttr(slide, 'aria-controlledby', id);
        }
      });
      // Set slide as active
      this.setSlide(index);
      this.start();
    }
  },
  watch: {
    value: function value(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setSlide(newVal);
      }
    },
    interval: function interval(newVal, oldVal) {
      if (newVal === oldVal) {
        return;
      }
      if (!newVal) {
        // Pausing slide show
        this.pause();
      } else {
        // Restarting or Changing interval
        this.pause();
        this.start();
      }
    },
    index: function index(val, oldVal) {
      var _this4 = this;

      if (val === oldVal || this.isSliding) {
        return;
      }
      // Determine sliding direction
      var direction = val > oldVal ? DIRECTION.next : DIRECTION.prev;
      // Rotates
      if (oldVal === 0 && val === this.slides.length - 1) {
        direction = DIRECTION.prev;
      } else if (oldVal === this.slides.length - 1 && val === 0) {
        direction = DIRECTION.next;
      }
      // Determine current and next slides
      var currentSlide = this.slides[oldVal];
      var nextSlide = this.slides[val];
      // Don't do anything if there aren't any slides to slide to
      if (!currentSlide || !nextSlide) {
        return;
      }
      // Start animating
      this.isSliding = true;
      this.$emit('sliding-start', val);
      // Update v-model
      this.$emit('input', this.index);
      nextSlide.classList.add(direction.overlayClass);
      // Trigger a reflow of next slide
      reflow(nextSlide);
      addClass(currentSlide, direction.dirClass);
      addClass(nextSlide, direction.dirClass);
      // Transition End handler
      var called = false;
      var onceTransEnd = function onceTransEnd(evt) {
        if (called) {
          return;
        }
        called = true;
        if (_this4.transitionEndEvent) {
          var events = _this4.transitionEndEvent.split(/\s+/);
          events.forEach(function (event) {
            eventOff(currentSlide, event, onceTransEnd);
          });
        }
        _this4._animationTimeout = null;
        removeClass(nextSlide, direction.dirClass);
        removeClass(nextSlide, direction.overlayClass);
        addClass(nextSlide, 'active');
        removeClass(currentSlide, 'active');
        removeClass(currentSlide, direction.dirClass);
        removeClass(currentSlide, direction.overlayClass);
        setAttr(currentSlide, 'aria-current', 'false');
        setAttr(nextSlide, 'aria-current', 'true');
        setAttr(currentSlide, 'aria-hidden', 'true');
        setAttr(nextSlide, 'aria-hidden', 'false');
        currentSlide.tabIndex = -1;
        nextSlide.tabIndex = -1;
        if (!_this4.isCycling) {
          // Focus the next slide for screen readers if not in play mode
          nextSlide.tabIndex = 0;
          _this4.$nextTick(function () {
            nextSlide.focus();
          });
        }
        _this4.isSliding = false;
        // Notify ourselves that we're done sliding (slid)
        _this4.$nextTick(function () {
          return _this4.$emit('sliding-end', val);
        });
      };
      // Clear transition classes after transition ends
      if (this.transitionEndEvent) {
        var events = this.transitionEndEvent.split(/\s+/);
        events.forEach(function (event) {
          eventOn(currentSlide, event, onceTransEnd);
        });
      }
      // Fallback to setTimeout
      this._animationTimeout = setTimeout(onceTransEnd, TRANS_DURATION);
    }
  },
  created: function created() {
    // Create private non-reactive props
    this._animationTimeout = null;
  },
  mounted: function mounted() {
    // Cache current browser transitionend event name
    this.transitionEndEvent = getTransisionEndEvent(this.$el) || null;
    // Get all slides
    this.updateSlides();
    // Observe child changes so we can update slide list
    observeDom(this.$refs.inner, this.updateSlides.bind(this), {
      subtree: false,
      childList: true,
      attributes: true,
      attributeFilter: ['id']
    });
  },
  beforeDestroy: function beforeDestroy() {
    clearInterval(this.intervalId);
    clearTimeout(this._animationTimeout);
    this.intervalId = null;
    this._animationTimeout = null;
  }
};