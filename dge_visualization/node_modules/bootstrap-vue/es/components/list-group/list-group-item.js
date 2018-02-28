function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData, pluckProps } from '../../utils';
import { assign } from '../../utils/object';
import { arrayIncludes } from '../../utils/array';
import Link, { propsFactory as linkPropsFactory } from '../link/link';

var actionTags = ['a', 'router-link', 'button', 'b-link'];
var linkProps = linkPropsFactory();
delete linkProps.href.default;
delete linkProps.to.default;

export var props = assign(linkProps, {
  tag: {
    type: String,
    default: 'div'
  },
  action: {
    type: Boolean,
    default: null
  },
  variant: {
    type: String,
    default: null
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _class;

    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    var tag = !props.href && !props.to ? props.tag : Link;

    var componentData = {
      staticClass: 'list-group-item',
      class: (_class = {
        'list-group-flush': props.flush
      }, _defineProperty(_class, 'list-group-item-' + props.variant, Boolean(props.variant)), _defineProperty(_class, 'active', props.active), _defineProperty(_class, 'disabled', props.disabled), _defineProperty(_class, 'list-group-item-action', Boolean(props.href || props.to || props.action || arrayIncludes(actionTags, props.tag))), _class),
      props: pluckProps(linkProps, props)
    };

    return h(tag, mergeData(data, componentData), children);
  }
};