// Copyright (c) 2020 UMI
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * @param {number} arg
 * @param {number} min
 * @param {number} max
 * @throws {Error}
 */
function validateInt (arg: number, min: number, max: number): void {
  if (typeof arg !== 'number') {
    throw new Error('incorrect type')
  }

  if (Math.floor(arg) !== arg) {
    throw new Error('not integer')
  }

  if (arg < min || arg > max) {
    throw new Error('incorrect value')
  }
}

/**
 * @param {Uint8Array} arg
 * @param {number} [len]
 */
function validateUint8Array (arg: Uint8Array, len?: number): void {
  if (!(arg instanceof Uint8Array)) {
    throw new Error('incorrect type')
  }

  if (len !== undefined && arg.byteLength !== len) {
    throw new Error('incorrect length')
  }
}

/**
 * @param {string} arg
 * @param {number} [len]
 */
function validateStr (arg: string, len?: number): void {
  if (typeof arg !== 'string') {
    throw new Error('incorrect type')
  }

  if (len !== undefined && arg.length !== len) {
    throw new Error('incorrect length')
  }
}

export { validateInt, validateStr, validateUint8Array }