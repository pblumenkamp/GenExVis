import { warn } from '../../utils';
import { idMixin, formStateMixin } from '../../mixins';
import bFormRow from '../layout/form-row';
import bFormText from '../form/form-text';
import bFormInvalidFeedback from '../form/form-invalid-feedback';
import bFormValidFeedback from '../form/form-valid-feedback';

export default {
  mixins: [idMixin, formStateMixin],
  components: { bFormRow: bFormRow, bFormText: bFormText, bFormInvalidFeedback: bFormInvalidFeedback, bFormValidFeedback: bFormValidFeedback },
  render: function render(h) {
    var t = this;
    var $slots = t.$slots;
    // Label
    var legend = h(false);
    if (t.label || $slots.label || t.horizontal) {
      legend = h('legend', { class: t.labelClasses, attrs: { id: t.labelId } }, [$slots.label || h('span', { domProps: { innerHTML: t.label || '' } })]);
    }
    // Invalid feeback text
    var invalidFeedback = h(false);
    if (t.invalidFeedback || t.feedback || $slots['invalid-feedback'] || $slots['feedback']) {
      invalidFeedback = h('b-form-invalid-feedback', {
        directives: [{
          name: 'show',
          rawName: 'v-show',
          value: Boolean(t.invalidFeedback || t.feedback || $slots['invalid-feedback'] || $slots['feedback']),
          expression: "Boolean(t.invalidFeedback || t.feedback || $slots['invalid-feedback'] || $slots['feedback'])"
        }],
        attrs: {
          id: t.invalidFeedbackId,
          role: 'alert',
          'aria-live': 'assertive',
          'aria-atomic': 'true'
        }
      }, [t.computedState === false ? $slots['invalid-feedback'] || $slots['feedback'] || h('span', { domProps: { innerHTML: t.invalidFeedback || t.feedback || '' } }) : h(false)]);
    }
    // Valid feeback text
    var validFeedback = h(false);
    if (t.validFeedback || $slots['valid-feedback']) {
      validFeedback = h('b-form-valid-feedback', {
        directives: [{
          name: 'show',
          rawName: 'v-show',
          value: Boolean(t.validFeedback || $slots['valid-feedback']),
          expression: "Boolean(t.validFeedback || $slots['valid-feedback'])"
        }],
        attrs: {
          id: t.validFeedbackId,
          role: 'alert',
          'aria-live': 'assertive',
          'aria-atomic': 'true'
        }
      }, [t.computedState === true ? $slots['valid-feedback'] || h('span', { domProps: { innerHTML: t.validFeedback || '' } }) : h(false)]);
    }
    // Form help text (description)
    var description = h(false);
    if (t.description || $slots['description']) {
      description = h('b-form-text', { attrs: { id: t.descriptionId } }, [$slots['description'] || h('span', { domProps: { innerHTML: t.description || '' } })]);
    }
    // Build layout
    var content = h('div', { ref: 'content', class: t.inputLayoutClasses }, [$slots.default, invalidFeedback, validFeedback, description]);
    // Generate fieldset wrapper
    return h('fieldset', {
      class: t.groupClasses,
      attrs: { id: t.safeId(), 'aria-describedby': t.describedByIds }
    }, [h('b-form-row', {}, [legend, content])]);
  },

  props: {
    horizontal: {
      type: Boolean,
      default: false
    },
    labelCols: {
      type: Number,
      default: 3,
      validator: function validator(value) {
        if (value >= 1 && value <= 11) {
          return true;
        }
        warn('b-form-group: label-cols must be a value between 1 and 11');
        return false;
      }
    },
    breakpoint: {
      type: String,
      default: 'sm'
    },
    labelTextAlign: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    labelSrOnly: {
      type: Boolean,
      default: false
    },
    labelClass: {
      type: [String, Array],
      default: null
    },
    description: {
      type: String,
      default: null
    },
    invalidFeedback: {
      type: String,
      default: null
    },
    feedback: {
      // Deprecated in favor of invalid-feedback
      type: String,
      default: null
    },
    validFeedback: {
      type: String,
      default: null
    },
    validated: {
      type: Boolean,
      value: false
    }
  },
  computed: {
    inputState: function inputState() {
      return this.stateClass;
    },
    groupClasses: function groupClasses() {
      return ['b-form-group', 'form-group', this.validated ? 'was-validated' : null, this.inputState];
    },
    labelClasses: function labelClasses() {
      return [this.labelSrOnly ? 'sr-only' : 'col-form-legend', this.labelLayout, this.labelAlignClass, this.labelClass];
    },
    labelLayout: function labelLayout() {
      if (this.labelSrOnly) {
        return null;
      }
      return this.horizontal ? 'col-' + this.breakpoint + '-' + this.labelCols : 'col-12';
    },
    labelAlignClass: function labelAlignClass() {
      if (this.labelSrOnly) {
        return null;
      }
      return this.labelTextAlign ? 'text-' + this.labelTextAlign : null;
    },
    inputLayoutClasses: function inputLayoutClasses() {
      return [this.horizontal ? 'col-' + this.breakpoint + '-' + (12 - this.labelCols) : 'col-12'];
    },
    labelId: function labelId() {
      return this.label || this.$slots['label'] ? this.safeId('_BV_label_') : null;
    },
    descriptionId: function descriptionId() {
      if (this.description || this.$slots['description']) {
        return this.safeId('_BV_description_');
      }
      return null;
    },
    invalidFeedbackId: function invalidFeedbackId() {
      if (this.invalidFeedback || this.feedback || this.$slots['invalid-feedback'] || this.$slots['feedback']) {
        return this.safeId('_BV_feedback_invalid_');
      }
      return null;
    },
    validFeedbackId: function validFeedbackId() {
      if (this.validFeedback || this.$slots['valid-feedback']) {
        return this.safeId('_BV_feedback_valid_');
      }
      return null;
    },
    describedByIds: function describedByIds() {
      return [this.labelId, this.descriptionId, this.computedState === false ? this.invalidFeedbackId : null, this.computedState === true ? this.validFeedbackId : null].filter(function (i) {
        return i;
      }).join(' ') || null;
    }
  }
};