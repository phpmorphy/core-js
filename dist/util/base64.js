/**
 * @license
 * Copyright (c) 2020 UMI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
/**
 * Декодирует Base64 строку в массив байтов.
 * @param {string} base64 Строка в кодировке Base64.
 * @returns {number[]}
 * @throws {Error}
 */
function base64Decode (base64) {
  const len = checkBase64Alphabet(base64)
  const b64 = base64.replace('=', 'A').replace('=', 'A')
  const res = []
  for (let i = 0, l = base64.length; i < l; i += 4) {
    let x = (base64Alphabet.indexOf(b64.charAt(i)) << 18)
    x |= (base64Alphabet.indexOf(b64.charAt(i + 1)) << 12)
    x |= (base64Alphabet.indexOf(b64.charAt(i + 2)) << 6)
    x |= base64Alphabet.indexOf(b64.charAt(i + 3))
    res[res.length] = (x >> 16) & 0xff
    res[res.length] = (x >> 8) & 0xff
    res[res.length] = x & 0xff
  }
  return res.slice(0, len)
}
/**
 * Кодирует массив байтов в Base64 строку.
 * @param {number[]} bytes Массив байтов.
 * @returns {string}
 */
function base64Encode (bytes) {
  const b = bytes.slice(0)
  let pad = ''
  while (b.length % 3) {
    b[b.length] = 0
    pad += '='
  }
  let res = ''
  for (let i = 0, l = b.length; i < l; i += 3) {
    const x = (b[i] << 16) | (b[i + 1] << 8) | b[i + 2]
    res += base64Alphabet.charAt((x >> 18) & 0x3f) + base64Alphabet.charAt((x >> 12) & 0x3f)
    res += base64Alphabet.charAt((x >> 6) & 0x3f) + base64Alphabet.charAt(x & 0x3f)
  }
  return res.slice(0, res.length - pad.length) + pad
}
/**
 * @param {string} chars
 * @return number
 * @throws {Error}
 * @private
 */
function checkBase64Alphabet (chars) {
  if (chars.length % 4) {
    throw new Error('base64: invalid length')
  }
  const charz = chars.replace('=', '').replace('=', '')
  for (let i = 0, l = charz.length; i < l; i++) {
    if (base64Alphabet.indexOf(charz.charAt(i)) === -1) {
      throw new Error('base64: invalid character')
    }
  }
  return (chars.length / 4 * 3) - (chars.length - charz.length)
}

exports.base64Decode = base64Decode
exports.base64Encode = base64Encode
