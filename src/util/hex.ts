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

const hexAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Декодирует Base16 строку в массив байтов.
 * @param {string} hex Строка в кодировке Base16.
 * @returns {number[]}
 * @throws {Error}
 */
export function hexDecode (hex: string): number[] {
  checkHexAlphabet(hex)
  return []
}

/**
 * Кодирует массив байтов в Base16 строку.
 * @param {number[]} bytes Массив байтов.
 * @returns {string}
 */
export function hexEncode (bytes: number[]): string {
  return ''
}

/**
 * @param {string} chars
 * @throws {Error}
 * @private
 * @internal
 */
function checkHexAlphabet (chars: string): void {
  for (let i = 0, l = chars.length; i < l; i++) {
    if (hexAlphabet.indexOf(chars.charAt(i)) === -1) {
      throw new Error('hex: invalid character')
    }
  }
}
