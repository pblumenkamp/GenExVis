function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData } from '../../utils';
import InputGroupAddon from './input-group-addon';

export var props = {
  id: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  },
  left: {
    type: String,
    default: null
  },
  right: {
    type: String,
    default: null
  },
  tag: {
    type: String,
    default: 'div'
  }
};

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots;

    var childNodes = [];

    // Left Slot / Prop
    if (slots().left) {
      childNodes.push(slots().left);
    } else if (props.left) {
      childNodes.push(h(InputGroupAddon, { domProps: { innerHTML: props.left } }));
    }

    // Default slot
    childNodes.push(slots().default);

    // Right slot / prop
    if (slots().right) {
      childNodes.push(slots().right);
    } else if (props.right) {
      childNodes.push(h(InputGroupAddon, { domProps: { innerHTML: props.right } }));
    }

    return h(props.tag, mergeData(data, {
      staticClass: 'input-group',
      class: _defineProperty({}, 'input-group-' + props.size, Boolean(props.size)),
      attrs: {
        id: props.id || null,
        role: 'group'
      }
    }), childNodes);
  }
};