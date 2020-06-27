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

// tslint:disable:no-bitwise

/**
 * Конвертер цифровой версии префикса в текстовое представление.
 * @param {number} version
 * @returns {string}
 * @throws {Error}
 * @private
 */
function versionToPrefix (version: number): string {
  if (typeof version !== 'number') {
    throw new Error('version must be number')
  }

  if (Math.floor(version) !== version) {
    throw new Error('version must be integer')
  }

  if (version === 0) {
    return 'genesis'
  }

  if ((version & 0x8000) === 0x8000) {
    throw new Error('incorrect version - first bit must be zero')
  }

  const a = (version & 0x7C00) >> 10
  const b = (version & 0x03E0) >> 5
  const c = (version & 0x001F)

  if (a < 1 || a > 26) {
    throw new Error('incorrect version - first char')
  }

  if (b < 1 || b > 26) {
    throw new Error('incorrect version - second char')
  }

  if (c < 1 || c > 26) {
    throw new Error('incorrect version - third char')
  }

  return String.fromCharCode((a + 96), (b + 96), (c + 96))
}

/**
 * Конвертер текстовой версии префикса в числовое представление.
 * @param {string} prefix
 * @returns {number}
 * @throws {Error}
 * @private
 */
function prefixToVersion (prefix: string): number {
  if (typeof prefix !== 'string') {
    throw new Error('prefix must be string')
  }

  if (prefix === 'genesis') {
    return 0
  }

  if (prefix.length !== 3) {
    throw new Error('prefix must be 3 bytes ling')
  }

  const a = prefix.charCodeAt(0) - 96
  const b = prefix.charCodeAt(1) - 96
  const c = prefix.charCodeAt(2) - 96

  if (a < 1 || a > 26) {
    throw new Error('incorrect prefix - first char')
  }

  if (b < 1 || b > 26) {
    throw new Error('incorrect prefix - second char')
  }

  if (c < 1 || c > 26) {
    throw new Error('incorrect prefix - third char')
  }

  return (a << 10) + (b << 5) + c
}

export { versionToPrefix, prefixToVersion }
