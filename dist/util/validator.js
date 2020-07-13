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
 * @param arg
 * @param {number} min
 * @param {number} max
 * @throws {Error}
 * @private
 */
function validateInt (arg, min, max) {
  if (typeof arg !== 'number') {
    throw new Error('invalid type')
  }
  if (Math.floor(arg) !== arg) {
    throw new Error('invalid integer')
  }
  if (arg < min || arg > max) {
    throw new Error('invalid value')
  }
}
/**
 * @param arg
 * @param {number} [len]
 * @throws {Error}
 * @private
 */
function validateStr (arg, len) {
  if (typeof arg !== 'string') {
    throw new Error('invalid type')
  }
  if (typeof len !== 'undefined' && arg.length !== len) {
    throw new Error('invalid length')
  }
}

exports.validateInt = validateInt
exports.validateStr = validateStr
