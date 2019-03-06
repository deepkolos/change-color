const matchAll = require('./utils').matchAll;
const markPosition = require('./utils').markPosition;

module.exports = {
  name: 'rgb',
  format: /(rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))/gi,
  opacityFormat: /(rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d\.]+\s*\))/gi,
  getNumStr: /\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*/gi,

  parse(searchStr, filterInRange) {
    const markFillOpacity = mark => {
      mark.str = mark.str.replace(')', ', 1)').replace(/rgb/i, 'rgba');
      return mark;
    };
    const markToColor = mark => {
      mark.color = mark.str
        .match(this.getNumStr)[0]
        .split(',')
        .map((num, i) => {
          if (i !== 3) {
            return parseInt(num, 10);
          } else {
            return parseFloat(num);
          }
        });
      return mark;
    };

    const matches = matchAll(this.format, searchStr).filter(filterInRange);
    const opacityMatches = matchAll(this.opacityFormat, searchStr).filter(
      filterInRange
    );

    return [
      ...matches.map(markPosition).map(markFillOpacity),
      ...opacityMatches.map(markPosition)
    ].map(markToColor);
  },

  stringify(color, withOpacity) {
    const rgb = color.slice(0, 3).map(num => Math.round(num));

    if (withOpacity) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${color[3]})`;
    } else {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
  }
};
