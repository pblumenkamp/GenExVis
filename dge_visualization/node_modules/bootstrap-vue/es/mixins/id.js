/*
 * SSR Safe Client Side ID attribute generation
 *
 */

export default {
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data: function data() {
    return {
      localId_: null
    };
  },
  mounted: function mounted() {
    if (!this.$isServer && !this.id && this._uid) {
      this.localId_ = '__BVID__' + this._uid + '_';
    }
  },

  methods: {
    safeId: function safeId() {
      var suffix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var id = this.id || this.localId_ || null;
      if (!id) {
        return null;
      }
      suffix = String(suffix).replace(/\s+/g, '_');
      return suffix ? id + '_' + suffix : id;
    }
  }
};