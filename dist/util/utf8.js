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

/**
 * Конвертер строки в типизированный массив UTF-8 байтов.
 * @param {string} text
 * @returns {number[]}
 * @private
 */
function Utf8Encode (text) {
  const bytes = []
  let i = 0
  while (i < text.length) {
    let code = text.charCodeAt(i++)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push((0xe0 | (code >> 12)), (0x80 | ((code >> 6) & 0x3f)))
      bytes.push(0x80 | (code & 0x3f))
    } else {
      code = 0x10000 + ((code & 0x3ff) << 10) + (text.charCodeAt(i++) & 0x3ff)
      bytes.push((0xf0 | (code >> 18)), (0x80 | ((code >> 12) & 0x3f)))
      bytes.push((0x80 | ((code >> 6) & 0x3f)), (0x80 | (code & 0x3f)))
    }
  }
  return bytes
}
/**
 * Конвертер из типизированного массива UTF-8 байтов в строку.
 * @param {number[]} bytes
 * @returns {string}
 * @private
 */
function Utf8Decode (bytes) {
  let str = ''
  let i = 0
  while (i < bytes.length) {
    if (bytes[i] < 0x80) {
      str += String.fromCharCode(bytes[i++])
    } else if ((bytes[i] > 0xBF) && (bytes[i] < 0xE0)) {
      str += String.fromCharCode((bytes[i++] & 0x1F) << 6 | bytes[i++] & 0x3F)
    } else if (bytes[i] > 0xDF && bytes[i] < 0xF0) {
      str += String.fromCharCode(((bytes[i++] & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F))
    } else {
      const code = (((bytes[i++] & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F)) - 0x010000
      str += String.fromCharCode(code >> 10 | 0xD800, code & 0x03FF | 0xDC00)
    }
  }
  return str
}

exports.Utf8Decode = Utf8Decode
exports.Utf8Encode = Utf8Encode
