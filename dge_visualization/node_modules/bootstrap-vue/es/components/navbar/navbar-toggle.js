import { listenOnRootMixin } from '../../mixins';

export default {
  mixins: [listenOnRootMixin],
  render: function render(h) {
    var t = this;
    return h('button', {
      class: ['navbar-toggler'],
      attrs: {
        type: 'button',
        'aria-label': t.label,
        'aria-controls': t.target,
        'aria-expanded': t.toggleState ? 'true' : 'false'
      },
      on: { click: t.onClick }
    }, [t.$slots.default || h('span', { class: ['navbar-toggler-icon'] })]);
  },
  data: function data() {
    return {
      toggleState: false
    };
  },

  props: {
    label: {
      type: String,
      default: 'Toggle navigation'
    },
    target: {
      type: String,
      required: true
    }
  },
  methods: {
    onClick: function onClick() {
      this.$root.$emit('bv::toggle::collapse', this.target);
    },
    handleStateEvt: function handleStateEvt(id, state) {
      if (id === this.target) {
        this.toggleState = state;
      }
    }
  },
  created: function created() {
    this.listenOnRoot('bv::collapse::state', this.handleStateEvt);
  }
};