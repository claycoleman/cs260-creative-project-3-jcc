Vue.component('v-style', {
  render: function(createElement) {
    return createElement(
      'style', // tag
      this.$slots.default // array of children
    );
  },
});

let app = new Vue({
  el: '#app',
  data: {
    colorText: 'rgb(16,75,140)',
    percentage: 2,
    originalColor: null,
    selectedColorIndex: 0,
    colors: [],
    loading: true,
    invalidColorInput: false,
    dropDown: false,
    dropDownText: 'Copied!',
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
    startDropDown(dropDownText) {
      clearTimeout(this.timeout);
      this.dropDownText = dropDownText;
      this.dropDown = true;
      this.timeout = setTimeout(() => {
        this.dropDown = false;
      }, 1500);
    },
    clickOriginal() {
      this.startDropDown('Button clicked!');
    },
    setCurrentColor(index) {
      this.selectedColorIndex = index;
    },
    // from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    fallbackCopyTextToClipboard(text, index, dropDownText) {
      var textArea = document.createElement('textarea');
      textArea.value = text;

      // Move it off screen.
      textArea.style.cssText = 'position: absolute; left: -99999em';

      // Set to readonly to prevent mobile devices opening a keyboard when
      // text is .select()'ed.
      textArea.setAttribute('readonly', true);

      document.body.appendChild(textArea);
      textArea.select();

      try {
        var successful = document.execCommand('copy');
        if (successful) {
          this.startDropDown(dropDownText);
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }

      document.body.removeChild(textArea);
    },
    copyText(text, index, dropDownText = 'Copied!') {
      this.selectedColorIndex = index;
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text, index, dropDownText);
        return;
      }
      navigator.clipboard.writeText(text).then(
        function() {
          this.startDropDown(dropDownText);
        },
        function(err) {
          console.error('Async: Could not copy text: ', err);
        }
      );
    },
    // main work done here
    generateColors() {
      let color = tinycolor(this.colorText);
      let percentage = parseFloat(this.percentage);
      if (!color.isValid() || !percentage) {
        this.invalidColorInput = true;
        return;
      } else {
        this.invalidColorInput = false;
      }
      this.selectedColorIndex = 0;

      console.log('valid color: ' + color.toHexString());

      this.originalColor = color;

      this.colors = [];

      // lighten
      for (let index = 1; index <= 5; index++) {
        this.colors.push({
          label: percentage * index + '% lightened',
          color: color.clone().lighten(percentage * index),
        });
      }

      // darken
      for (let index = 1; index <= 5; index++) {
        this.colors.push({
          label: percentage * index + '% darkened',
          color: color.clone().darken(percentage * index),
        });
      }

      color.analogous().map((c, index) => {
        if (index == 0) return;
        this.colors.push({
          label: 'analogous #' + index,
          color: c,
        });
      });
      color.monochromatic().map((c, index) => {
        if (index == 0) return;
        this.colors.push({
          label: 'monochromatic #' + index,
          color: c,
        });
      });
    },
    getSampleStyle(colorItem) {
      let color = colorItem.color != null ? colorItem.color : colorItem;
      return `background-color: ${color.toHexString()};`;
    },
    getHoverStylesText() {
      return `
.your-class {
  background-color: ${this.originalColor.toHexString()};
  transition: all 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1), cubic-bezier(0.4, 0, 0.2, 1);
  transition-property: background-color;
}

.your-class:hover {
  background-color: ${this.colors[this.selectedColorIndex].color.toHexString()};
}
`;
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
