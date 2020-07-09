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

import { prefixToVersion, versionToPrefix } from './converter'
import { arrayNew, arraySet } from './array'
import { uint16ToBytes } from './integer'

const bech32Alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

/**
 * @param {number[]|Uint8Array|Buffer} bytes
 * @returns {string}
 * @private
 * @internal
 */
function bech32Encode (bytes: number[] | Uint8Array | Buffer): string {
  const prefix = versionToPrefix((bytes[0] << 8) + bytes[1])
  const data = convert8to5(bytes.slice(2))
  const checksum = createChecksum(prefix, data)

  return prefix + '1' + data + checksum
}

/**
 * @param {string} bech32
 * @returns {number[]}
 * @private
 * @internal
 */
function bech32Decode (bech32: string): number[] {
  if (bech32.length !== 62 && bech32.length !== 66) {
    throw new Error('bech32: invalid length')
  }

  const str = bech32.toLowerCase()
  const sepPos = str.lastIndexOf('1')

  if (sepPos === -1) {
    throw new Error('bech32: missing separator')
  }

  const pfx = str.slice(0, sepPos)
  const ver = prefixToVersion(pfx)
  const data = str.slice(sepPos + 1)
  checkAlphabet(data)
  verifyChecksum(pfx, data)

  return uint16ToBytes(ver).concat(convert5to8(data.slice(0, -6)))
}

/**
 * @param {string} data
 * @returns {number[]}
 * @private
 * @internal
 */
function convert5to8 (data: string): number[] {
  let value = 0
  let bits = 0
  const bytes = strToBytes(data)
  const result: number[] = []

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 5) | bytes[i]
    bits += 5

    while (bits >= 8) {
      bits -= 8
      result.push((value >> bits) & 0xff)
    }
  }

  if ((bits >= 5) || (value << (8 - bits)) & 0xff) {
    throw new Error('bech32: invalid data')
  }

  return result
}

/**
 * @param {number[]|Uint8Array|Buffer} data
 * @returns {string}
 * @private
 * @internal
 */
function convert8to5 (data: number[] | Uint8Array | Buffer): string {
  let value = 0
  let bits = 0
  let result: string = ''

  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i]
    bits += 8

    while (bits >= 5) {
      bits -= 5
      result += bech32Alphabet[(value >> bits) & 0x1f]
    }
  }

  /** @istanbul ignore else */
  if (bits > 0) {
    result += bech32Alphabet[(value << (5 - bits)) & 0x1f]
  }

  return result
}

/**
 * @param {string} prefix
 * @param {string} data
 * @returns {string}
 * @private
 * @internal
 */
function createChecksum (prefix: string, data: string): string {
  const bytes = strToBytes(data)
  const pfx = prefixExpand(prefix)
  const values = arrayNew(pfx.length + bytes.length + 6)
  arraySet(values, pfx)
  arraySet(values, bytes, pfx.length)

  const poly = polyMod(values) ^ 1

  let checksum = ''
  for (let i = 0; i < 6; i++) {
    checksum += bech32Alphabet[(poly >> 5 * (5 - i)) & 31]
  }

  return checksum
}

/**
 * @param {number[]|Uint8Array|Buffer} values
 * @returns {number}
 * @private
 * @internal
 */
function polyMod (values: number[] | Uint8Array | Buffer): number {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  let top
  for (let i = 0, l = values.length; i < l; i++) {
    top = chk >> 25
    chk = (chk & 0x1ffffff) << 5 ^ values[i]

    for (let j = 0; j < 5; j++) {
      chk ^= ((top >> j) & 1)
        ? gen[j]
        : 0
    }
  }

  return chk
}

/**
 * @param {string} prefix
 * @returns {number[]}
 * @private
 * @internal
 */
function prefixExpand (prefix: string): number[] {
  const res = arrayNew((prefix.length * 2) + 1)

  for (let i = 0, l = prefix.length; i < l; i++) {
    const ord = prefix.charCodeAt(i)
    res[i] = ord >> 5
    res[i + l + 1] = ord & 31
  }

  return res
}

/**
 * @param {string} str
 * @returns {number[]}
 * @private
 * @internal
 */
function strToBytes (str: string): number[] {
  const bytes: number[] = []
  for (let i = 0, l = str.length; i < l; i++) {
    bytes.push(bech32Alphabet.indexOf(str[i]))
  }

  return bytes
}

/**
 * @param {string} prefix
 * @param {string} data
 * @private
 * @internal
 */
function verifyChecksum (prefix: string, data: string): void {
  const pfx = prefixExpand(prefix)
  const bytes = strToBytes(data)

  const values = arrayNew(pfx.length + bytes.length)
  arraySet(values, pfx)
  arraySet(values, bytes, pfx.length)

  const poly = polyMod(values)

  if (poly !== 1) {
    throw new Error('bech32: invalid checksum')
  }
}

/**
 * @param {string} chars
 * @private
 * @internal
 */
function checkAlphabet (chars: string): void {
  for (let i = 0, l = chars.length; i < l; i++) {
    if (bech32Alphabet.indexOf(chars[i]) === -1) {
      throw new Error('bech32: invalid character')
    }
  }
}

export { bech32Encode, bech32Decode }
