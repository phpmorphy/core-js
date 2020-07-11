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

import { validateInt, validateStr } from '../util/validator'

/**
 * Конвертер цифровой версии префикса в текстовое представление.
 * @param {number} version
 * @returns {string}
 * @throws {Error}
 * @private
 * @internal
 */
function versionToPrefix (version: number): string {
  validateInt(version, 0, 65535)

  if (version === 0) {
    return 'genesis'
  }

  if ((version & 0x8000) === 0x8000) {
    throw new Error('bech32: incorrect version')
  }

  const a = (version & 0x7C00) >> 10
  const b = (version & 0x03E0) >> 5
  const c = (version & 0x001F)

  checkPrefixChars([a, b, c])

  return String.fromCharCode((a + 96), (b + 96), (c + 96))
}

/**
 * Конвертер текстовой версии префикса в числовое представление.
 * @param {string} prefix
 * @returns {number}
 * @throws {Error}
 * @private
 * @internal
 */
function prefixToVersion (prefix: string): number {
  if (prefix === 'genesis') {
    return 0
  }

  validateStr(prefix, 3)

  const a = prefix.charCodeAt(0) - 96
  const b = prefix.charCodeAt(1) - 96
  const c = prefix.charCodeAt(2) - 96

  checkPrefixChars([a, b, c])

  return (a << 10) + (b << 5) + c
}

/**
 * @param {number[]} chars
 * @throws {Error}
 * @private
 * @internal
 */
function checkPrefixChars (chars: number[]): void {
  for (let i = 0, l = chars.length; i < l; i++) {
    if (chars[i] < 1 || chars[i] > 26) {
      throw new Error('bech32: incorrect prefix character')
    }
  }
}

/**
 * @param {number} value
 * @returns {number[]}
 * @private
 * @internal
 */
function uint64ToBytes (value: number): number[] {
  const l = ((value >>> 24) * 16777216) + (value & 0x00ffffff)
  const h = (value - l) / 4294967296 // value >>> 32
  return [
    ((h >> 24) & 0xff), ((h >> 16) & 0xff), ((h >> 8) & 0xff), (h & 0xff),
    ((l >> 24) & 0xff), ((l >> 16) & 0xff), ((l >> 8) & 0xff), (l & 0xff)]
}

/**
 * @param {number[]} bytes
 * @returns {number}
 * @private
 * @internal
 */
function bytesToUint64 (bytes: number[]): number {
  const h = (bytes[0] * 16777216) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]
  const l = (bytes[4] * 16777216) + (bytes[5] << 16) + (bytes[6] << 8) + bytes[7]
  return (h * 4294967296) + l // h << 32 | l
}

/**
 * @param {number} value
 * @returns {number[]}
 * @private
 * @internal
 */
function uint16ToBytes (value: number): number[] {
  return [((value >> 8) & 0xff), (value & 0xff)]
}

/**
 * @param {number[]} bytes
 * @returns {number}
 * @private
 * @internal
 */
function bytesToUint16 (bytes: number[]): number {
  return (bytes[0] << 8) | bytes[1]
}

export { versionToPrefix, prefixToVersion, uint64ToBytes, bytesToUint64, uint16ToBytes, bytesToUint16 }
