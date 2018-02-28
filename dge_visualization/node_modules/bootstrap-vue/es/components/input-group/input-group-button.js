import { mergeData } from '../../utils';

export var props = {
  id: {
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
        children = _ref.children;

    return h(props.tag, mergeData(data, {
      staticClass: 'input-group-btn',
      attrs: {
        id: props.id
      }
    }), children);
  }
};