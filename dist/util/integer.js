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
 * @param {number} value
 * @returns {number[]}
 * @private
 */
function uint64ToBytes (value) {
  const l = ((value >>> 24) * 16777216) + (value & 0x00ffffff)
  const h = (value - l) / 4294967296
  return [
    ((h >> 24) & 0xff), ((h >> 16) & 0xff), ((h >> 8) & 0xff), (h & 0xff),
    ((l >> 24) & 0xff), ((l >> 16) & 0xff), ((l >> 8) & 0xff), (l & 0xff)
  ]
}
/**
 * @param {number[]} bytes
 * @returns {number}
 * @private
 */
function bytesToUint64 (bytes) {
  const h = (bytes[0] * 16777216) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]
  const l = (bytes[4] * 16777216) + (bytes[5] << 16) + (bytes[6] << 8) + bytes[7]
  return (h * 4294967296) + l
}
/**
 * @param {number} value
 * @returns {number[]}
 * @private
 */
function uint16ToBytes (value) {
  return [((value >> 8) & 0xff), (value & 0xff)]
}
/**
 * @param {number[]} bytes
 * @returns {number}
 * @private
 */
function bytesToUint16 (bytes) {
  return (bytes[0] << 8) | bytes[1]
}

exports.bytesToUint16 = bytesToUint16
exports.bytesToUint64 = bytesToUint64
exports.uint16ToBytes = uint16ToBytes
exports.uint64ToBytes = uint64ToBytes
