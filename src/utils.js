const utils = {
  matchAll(regex, str) {
    if (!regex.exec) return [];

    let match;
    const matches = [];

    while ((match = regex.exec(str))) {
      match && matches.push(match);
    }

    return matches;
  },

  isInRange(curr, min, max) {
    return curr >= min && curr <= max;
  },

  markPosition(match) {
    return {
      str: match[1],
      origin: match[1],
      start: match.index,
      length: match[1].length
    };
  },

  filterInRange (searchStr, searchStartLen, searchEndLen, match)  {
    const min = searchStartLen;
    const max = searchStr.length - searchEndLen;
    const offsetStart = match.index;
    const offsetEnd = match.index + match[1].length - 1;
  
    return (
      utils.isInRange(offsetStart, min, max) ||
      utils.isInRange(offsetEnd, min, max) ||
      (offsetStart < min && offsetEnd > max)
    );
  }
};

module.exports = utils