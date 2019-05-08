<template>
  <div>
    <input
      :id="id"
      type="file"
      class="inputfile"
      :multiple="multiple"
      @change="loadFiles"
    >
    <label :for="id">
      <strong>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="17"
          viewBox="0 0 20 17"
        >
          <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
        </svg> {{ buttonDescription }}
      </strong>
      <span>{{ fileDescription }}</span>
    </label>
  </div>
</template>

<script>
  export default {
    name: 'FileChooser',
    props: {
      multiple: {
        type: Boolean
      }
    },
    data () {
      return {
        id: null,
        files: []
      }
    },
    computed: {
      fileDescription () {
        if (this.files && this.files.length > 1) {
          return this.files.length + ' files selected'
        } else if (this.files && this.files.length === 1) {
          return this.files[0].name
        } else {
          return ''
        }
      },
      buttonDescription () {
        if (this.multiple) {
          return 'Choose files…'
        } else {
          return 'Choose a file…'
        }
      }
    },
    mounted () {
      this.id = this._uid
    },
    methods: {
      loadFiles (event) {
        this.files = event.target.files
        this.$emit('change', event)
      }
    }
  }
</script>

<style scoped>
  .inputfile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .inputfile + label {
    max-width: 80%;
    font-size: 1rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    padding: 0.625rem 1.25rem;
  }
  .no-js .inputfile + label {
    display: none;
  }
  .inputfile:focus + label,
  .inputfile.has-focus + label {
    outline: 1px dotted #000;
    outline: -webkit-focus-ring-color auto 5px;
  }
  .inputfile + label * {
    /* pointer-events: none; */
    /* in case of FastClick lib use */
  }
  .inputfile + label svg {
    width: 1.2rem;
    height: 1.2rem;
    vertical-align: middle;
    fill: currentColor;
    margin-top: -0.25rem;
    margin-right: 0.25rem;
  }
  .inputfile + label {
    color: #6c757d;
    border: 1px solid #6c757d;
    background-color: #e9ecef;
    padding: 0;
  }
  .inputfile:focus + label,
  .inputfile.has-focus + label,
  .inputfile + label:hover {
    border-color: #212529;
  }
  .inputfile + label span,
  .inputfile + label strong {
    padding: 0.625rem 1.25rem;
  }

  .inputfile + label span {
    width: 20rem;
    max-width: 30rem;
    min-height: 2rem;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: top;
  }

  .inputfile + label strong {
    min-width: 10rem;
    height: 100%;
    color: #e9ecef;
    background-color: #6c757d;
    display: inline-block;
  }

  .inputfile:focus + label strong,
  .inputfile.has-focus + label strong,
  .inputfile + label:hover strong {
    background-color: #212529;
  }

  @media screen and (max-width: 50rem) {
    .inputfile + label strong {
      display: block;
    }
  }
</style>
