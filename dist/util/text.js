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
 * Декодирует массив байтов UTF-8 в строку в кодировке UTF-16.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
 * @param {number[]} bytes Массив байтов UTF-8.
 * @returns {string}
 */
function textDecode (bytes) {
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
/**
 * Кодирует UTF-16 строку в массив байтов UTF-8.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 * @param {string} text Текстовая строка в кодировке UTF-16.
 * @returns {number[]}
 */
function textEncode (text) {
  const b = []
  let i = 0
  while (i < text.length) {
    const code = text.charCodeAt(i++)
    if (code < 0x80) {
      b[b.length] = code
    } else if (code < 0x800) {
      b[b.length] = 0xc0 | (code >> 6)
      b[b.length] = 0x80 | (code & 0x3f)
    } else if (code < 0xd800 || code >= 0xe000) {
      b[b.length] = 0xe0 | (code >> 12)
      b[b.length] = 0x80 | ((code >> 6) & 0x3f)
      b[b.length] = 0x80 | (code & 0x3f)
    } else {
      encodeUtf8Mb4(b, 0x10000 + ((code & 0x3ff) << 10) + (text.charCodeAt(i++) & 0x3ff))
    }
  }
  return b
}
/**
 * @param {number[]} b
 * @param {number} code
 */
function encodeUtf8Mb4 (b, code) {
  b[b.length] = 0xf0 | (code >> 18)
  b[b.length] = 0x80 | ((code >> 12) & 0x3f)
  b[b.length] = 0x80 | ((code >> 6) & 0x3f)
  b[b.length] = 0x80 | (code & 0x3f)
}

exports.textDecode = textDecode
exports.textEncode = textEncode
