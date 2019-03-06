const matchAll = require('./utils').matchAll;
const markPosition = require('./utils').markPosition;

const numToHex = num => {
  const str = num.toString(16);
  return str.length === 1 ? '0' + str : str;
};

module.exports = {
  name: 'hex',
  longFormat: /(\#[a-f0-9]{6})(?!\w)/gi,
  shortFormat: /(\#[a-f0-9]{3})(?!\w)/gi,
  longOpacityFormat: /(\#[a-f0-9]{8})(?!\w)/gi,
  shortOpacityFormat: /(\#[a-f0-9]{4})(?!\w)/gi,

  parse(searchStr, filterInRange) {
    const markToLong = mark => {
      mark.str =
        '#' +
        mark.str
          .slice(1)
          .split('')
          .map(char => char + char)
          .join('');
      return mark;
    };
    const markFillOpacity = mark => {
      if (mark.str.length === 7) mark.str += 'ff';
      return mark;
    };
    const markToColor = mark => {
      mark.color = [
        parseInt(mark.str.slice(1, 3), 16),
        parseInt(mark.str.slice(3, 5), 16),
        parseInt(mark.str.slice(5, 7), 16),
        parseInt(mark.str.slice(7, 9), 16) / 255
      ];

      return mark;
    };

    const longMatches = matchAll(this.longFormat, searchStr).filter(
      filterInRange
    );
    const shortMatches = matchAll(this.shortFormat, searchStr).filter(
      filterInRange
    );
    const shortOpacityMatches = matchAll(
      this.shortOpacityFormat,
      searchStr
    ).filter(filterInRange);
    const longOpacityMatches = matchAll(
      this.longOpacityFormat,
      searchStr
    ).filter(filterInRange);

    return [
      ...longMatches.map(markPosition).map(markFillOpacity),
      ...shortMatches
        .map(markPosition)
        .map(markToLong)
        .map(markFillOpacity),
      ...longOpacityMatches.map(markPosition),
      ...shortOpacityMatches.map(markPosition).map(markToLong)
    ].map(markToColor);
  },

  stringify(color, withOpacity) {
    let hex = `#${color
      .slice(0, 3)
      .map(num => Math.round(num))
      .map(numToHex)
      .join('')}`;

    if (withOpacity) {
      hex += numToHex(Math.floor(color[3] * 255));
    }

    return hex;
  }
};
