let app = new Vue({
  el: '#app',
  data: {
    colorText: 'rgb(16,75,140)',
    percentage: 6,
    originalColor: null,
    selectedColorIndex: 0,
    colors: [],
    loading: true,
    invalidColorInput: false,
    copied: false,
  },
  created() {
    this.startApp();
  },
  methods: {
    startApp() {
      setTimeout(() => {
        this.loading = false;
      }, 1250);
    },
    // from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    fallbackCopyTextToClipboard(text, index) {
      var textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var successful = document.execCommand('copy');
        if (successful) {
          this.copied = true;
          this.timeout = setTimeout(() => {
            this.copied = false;
          }, 1500);
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }

      document.body.removeChild(textArea);
    },
    copyText(text, index) {
      this.selectedColorIndex = index;
      clearTimeout(this.timeout);
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text, index);
        return;
      }
      navigator.clipboard.writeText(text).then(
        function() {
          this.copied = true;
          this.timeout = setTimeout(() => {
            this.copied = false;
          }, 500);
        },
        function(err) {
          console.error('Async: Could not copy text: ', err);
        }
      );
    },
    generateColors() {
      let color = tinycolor(this.colorText);
      let percentage = parseFloat(this.percentage);
      if (!color.isValid() || !percentage) {
        this.invalidColorInput = true;
        return;
      } else {
        this.invalidColorInput = false;
      }
      console.log('valid color: ' + color.toHexString());

      this.originalColor = color;

      this.colors = [];

      // lighten
      for (let index = 1; index <= 5; index++) {
        this.colors.push({
          copied: false,
          label: percentage * index + '% lightened',
          color: color.clone().lighten(percentage * index),
        });
      }

      // darken
      for (let index = 1; index <= 5; index++) {
        this.colors.push({
          copied: false,
          label: percentage * index + '% darkened',
          color: color.clone().darken(percentage * index),
        });
      }

      color.analogous().map((c, index) => {
        if (index == 0) return;
        this.colors.push({
          copied: false,
          label: 'analogous #' + index,
          color: c,
        });
      });
      color.monochromatic().map((c, index) => {
        if (index == 0) return;
        this.colors.push({
          copied: false,
          label: 'monochromatic #' + index,
          color: c,
        });
      });

      // toHexString
      // toRgbString
    },
    getSampleStyle(colorItem) {
      let color = colorItem.color != null ? colorItem.color : colorItem;
      return `height: 45px; background-color: ${color.toHexString()};`;
    },
  },
  computed: {
    hasColorText() {
      return this.colorText.trim().length !== 0;
    },
    hasPercentage() {
      return ('' + this.percentage).trim().length !== 0;
    },
  },
  watch: {},
});
