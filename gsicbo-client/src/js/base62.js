/**
 * BASE62 인코딩 기능 구현
 */
'use strict'

const TBL_BASE10_BASE62 = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i",
  "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B",
  "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
  "V", "W", "X", "Y", "Z"
]

export default (b10, len) => {
  if (b10 < 0) {
    return undefined;
  }
  if (b10 < 62) {
    return `${TBL_BASE10_BASE62[b10]}`;
  }

  let i = 0;
  let arr = [];
  let remain = b10;
  while (remain / Math.pow(62, i) >= 1) {
    let mod = remain % Math.pow(62, i + 1);
    arr.unshift(TBL_BASE10_BASE62[mod / Math.pow(62, i)]);
    remain -= mod;
    i++;
  }

  const padSize = len - arr.length;
  for (let i = 0; i < padSize; i++) {
    arr.unshift('0');
  }
  return arr.join('');
}
