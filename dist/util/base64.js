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
 * @param {number[]} bytes
 * @returns {string}
 * @private
 */
function base64Encode (bytes) {
  let res = ''
  for (let i = 0, l = bytes.length; i < l; i += 3) {
    const x = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    res += base64Alphabet[(x >> 18) & 0x3f] + base64Alphabet[(x >> 12) & 0x3f]
    res += base64Alphabet[(x >> 6) & 0x3f] + base64Alphabet[x & 0x3f]
  }
  return res
}
/**
 * @param {string} base64
 * @returns {number[]}
 * @throws {Error}
 * @private
 */
function base64Decode (base64) {
  checkBase64Alphabet(base64)
  const res = []
  for (let i = 0, l = base64.length; i < l; i += 4) {
    let x = (base64Alphabet.indexOf(base64[i]) << 18)
    x |= (base64Alphabet.indexOf(base64[i + 1]) << 12)
    x |= (base64Alphabet.indexOf(base64[i + 2]) << 6)
    x |= base64Alphabet.indexOf(base64[i + 3])
    res.push(((x >> 16) & 0xff), ((x >> 8) & 0xff), (x & 0xff))
  }
  return res
}
/**
 * @param {string} chars
 * @throws {Error}
 * @private
 */
function checkBase64Alphabet (chars) {
  for (const chr of chars) {
    if (base64Alphabet.indexOf(chr) === -1) {
      throw new Error('base64: invalid character')
    }
  }
}

exports.base64Decode = base64Decode
exports.base64Encode = base64Encode
