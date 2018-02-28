import { isArray } from '../utils/array';
import { keys } from '../utils/object';

function isObject(obj) {
  return obj && {}.toString.call(obj) === '[object Object]';
}

export default {
  props: {
    options: {
      type: [Array, Object],
      default: function _default() {
        return [];
      }
    },
    valueField: {
      type: String,
      default: 'value'
    },
    textField: {
      type: String,
      default: 'text'
    },
    disabledField: {
      type: String,
      default: 'disabled'
    }
  },
  computed: {
    formOptions: function formOptions() {
      var options = this.options || [];

      var valueField = this.valueField || 'value';
      var textField = this.textField || 'text';
      var disabledField = this.disabledField || 'disabled';

      if (isArray(options)) {
        // Normalize flat-ish arrays to Array of Objects
        return options.map(function (option) {
          if (isObject(option)) {
            return {
              value: option[valueField],
              text: String(option[textField]),
              disabled: option[disabledField] || false
            };
          }
          return {
            text: String(option),
            value: option,
            disabled: false
          };
        });
      } else if (isObject(options)) {
        // Normalize Objects to Array of Objects
        return keys(options).map(function (key) {
          var option = options[key] || {};
          if (isObject(option)) {
            var value = option[valueField];
            var text = option[textField];
            return {
              text: typeof text === 'undefined' ? key : String(text),
              value: typeof value === 'undefined' ? key : value,
              disabled: option[disabledField] || false
            };
          }
          return {
            text: String(option),
            value: key,
            disabled: false
          };
        });
      }
      // Option unsupported type
      return [];
    }
  }
};