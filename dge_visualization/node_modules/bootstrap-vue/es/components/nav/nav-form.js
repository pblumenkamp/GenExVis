import Form from '../form/form';
import { mergeData } from '../../utils';

export default {
  functional: true,
  props: {
    id: {
      type: String,
      default: null
    }
  },
  render: function render(h, _ref) {
    var props = _ref.props,
        data = _ref.data,
        children = _ref.children;

    return h(Form, mergeData(data, { attrs: { id: props.id }, props: { inline: true } }), children);
  }
};