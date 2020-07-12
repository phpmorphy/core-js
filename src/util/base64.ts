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

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Декодирует Base64 строку в массив байтов.
 * @param {string} base64 Строка в кодировке Base64.
 * @returns {number[]}
 * @throws {Error}
 */
export function base64Decode (base64: string): number[] {
  checkBase64Alphabet(base64)
  const res: number[] = []
  for (let i = 0, l = base64.length; i < l; i += 4) {
    let x = (base64Alphabet.indexOf(base64.charAt(i)) << 18)
    x |= (base64Alphabet.indexOf(base64.charAt(i + 1)) << 12)
    x |= (base64Alphabet.indexOf(base64.charAt(i + 2)) << 6)
    x |= base64Alphabet.indexOf(base64.charAt(i + 3))
    res.push(((x >> 16) & 0xff), ((x >> 8) & 0xff), (x & 0xff))
  }
  return res
}

/**
 * Кодирует массив байтов в Base64 строку.
 * @param {number[]} bytes Массив байтов.
 * @returns {string}
 */
export function base64Encode (bytes: number[]): string {
  let res = ''
  for (let i = 0, l = bytes.length; i < l; i += 3) {
    const x = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    res += base64Alphabet.charAt((x >> 18) & 0x3f) + base64Alphabet.charAt((x >> 12) & 0x3f)
    res += base64Alphabet.charAt((x >> 6) & 0x3f) + base64Alphabet.charAt(x & 0x3f)
  }
  return res
}

/**
 * @param {string} chars
 * @throws {Error}
 * @private
 * @internal
 */
function checkBase64Alphabet (chars: string): void {
  for (let i = 0, l = chars.length; i < l; i++) {
    if (base64Alphabet.indexOf(chars.charAt(i)) === -1) {
      throw new Error('base64: invalid character')
    }
  }
}
