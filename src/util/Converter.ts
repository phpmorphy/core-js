/**
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

/**
 * @function
 * @param {number} version version
 * @returns {string} prefix
 */
export function uint16ToPrefix (version: number): string {
  if (version === 0) {
    return 'genesis'
  }

  // tslint:disable:no-bitwise
  return String.fromCharCode(
    (((version & 0x7C00) >> 10) + 96),
    (((version & 0x03E0) >> 5) + 96),
    ((version & 0x001F) + 96),
  )
}

/**
 * @function
 * @param {string} prefix prefix
 * @returns {number} version
 */
export function prefixToUint16 (prefix: string): number {
  if (prefix === 'genesis') {
    return 0
  }

  // tslint:disable:no-bitwise
  return ((prefix.charCodeAt(0) - 96) << 10) +
    ((prefix.charCodeAt(1) - 96) << 5) +
    ((prefix.charCodeAt(2) - 96))
}