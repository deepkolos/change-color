const matchAll = require('./utils').matchAll;
const markPosition = require('./utils').markPosition;

const HSLA2RGBA = ([h, s, l, a]) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255, a];
};

const RGBA2HSLA = ([r, g, b, a]) => {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100), a];
};

module.exports = {
  name: 'hsl',
  format: /(hsl\(\s*\d+\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%\s*\))/gi,
  opacityFormat: /(hsla\(\s*\d+\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+\s*\))/gi,
  getNumStr: /\s*\d+\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+\s*/gi,

  parse(searchStr, filterInRange) {
    const markFillOpacity = mark => {
      mark.str = mark.str.replace(')', ', 1)').replace(/hsl/i, 'hsla');
      return mark;
    };
    const markToColor = mark => {
      const hsla = mark.str
        .match(this.getNumStr)[0]
        .split(',')
        .map((num, i) => {
          switch (i) {
            case 0:
              return parseInt(num, 10);
            case 1:
            case 2:
              return parseFloat(num.replace('%', ''));
            case 3:
              return parseFloat(num);
          }
        });
      mark.color = HSLA2RGBA(hsla);
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
    const hsla = RGBA2HSLA(color);

    if (withOpacity) {
      return `hsla(${hsla[0]}, ${hsla[1]}%, ${hsla[2]}%, ${hsla[3]})`;
    } else {
      return `hsl(${hsla[0]}, ${hsla[1]}%, ${hsla[2]}%)`;
    }
  }
};
