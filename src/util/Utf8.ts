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

function Utf8Encode (text: string): Uint8Array {
  const bytes = []
  for (let i = 0; i < text.length; i++) {
    let chr = text.charCodeAt(i)
    if (chr < 0x80) { // ascii
      bytes.push(chr)
    } else if (chr < 0x800) {
      bytes.push(
        0xc0 | (chr >> 6),
        0x80 | (chr & 0x3f)
      )
    } else if (chr < 0xd800 || chr >= 0xe000) {
      bytes.push(
        0xe0 | (chr >> 12),
        0x80 | ((chr >> 6) & 0x3f),
        0x80 | (chr & 0x3f)
      )
    } else { // surrogate pair
      chr = 0x10000 + ((chr & 0x3ff) << 10) + (text.charCodeAt(++i) & 0x3ff)
      bytes.push(
        0xf0 | (chr >> 18),
        0x80 | ((chr >> 12) & 0x3f),
        0x80 | ((chr >> 6) & 0x3f),
        0x80 | (chr & 0x3f)
      )
    }
  }

  return new Uint8Array(bytes)
}

function Utf8Decode (bytes: Uint8Array): string {
  let str = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    const chr = bytes[i]
    if (chr < 0x80) { // ascii
      str += String.fromCharCode(chr)
    } else if (chr > 0xBF && chr < 0xE0) {
      str += String.fromCharCode((chr & 0x1F) << 6 | bytes[++i] & 0x3F)
    } else if (chr > 0xDF && chr < 0xF0) {
      str += String.fromCharCode(
        (chr & 0x0F) << 12 | (bytes[++i] & 0x3F) << 6 | bytes[++i] & 0x3F)
    } else { // surrogate pair
      const charCode = ((chr & 0x07) << 18 | (bytes[++i] & 0x3F) << 12 |
        (bytes[++i] & 0x3F) << 6 | bytes[++i] & 0x3F) - 0x010000
      str += String.fromCharCode(charCode >> 10 | 0xD800,
        charCode & 0x03FF | 0xDC00)
    }
  }

  return str
}

export { Utf8Decode, Utf8Encode }
