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

const converter = require('./converter.js')

const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
/**
 * @param {number[]|Uint8Array|Buffer} bytes
 * @returns {string}
 */
function encode (bytes) {
  const version = (bytes[0] << 8) + bytes[1]
  const prefix = converter.versionToPrefix(version)
  const data = convert8to5(bytes.slice(2))
  const checksum = createChecksum(prefix, data)
  return prefix + '1' + data + checksum
}
/**
 * @param {string} bech32
 * @returns {number[]}
 */
function decode (bech32) {
  if (bech32.length !== 62 && bech32.length !== 66) {
    throw new Error('bech32: invalid length')
  }
  const str = bech32.toLowerCase()
  const sepPos = str.lastIndexOf('1')
  if (sepPos === -1) {
    throw new Error('bech32: missing separator')
  }
  const pfx = str.slice(0, sepPos)
  const ver = converter.prefixToVersion(pfx)
  const data = str.slice(sepPos + 1)
  checkAlphabet(data)
  verifyChecksum(pfx, data)
  const res = []
  res[0] = (ver >>> 8) & 0xff
  res[1] = ver & 0xff
  return res.concat(convert5to8(data.slice(0, -6)))
}
function convert5to8 (data) {
  let value = 0
  let bits = 0
  const bytes = strToBytes(data)
  const result = []
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
function convert8to5 (data) {
  let value = 0
  let bits = 0
  let result = ''
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i]
    bits += 8
    while (bits >= 5) {
      bits -= 5
      result += alphabet[(value >> bits) & 0x1f]
    }
  }
  /* istanbul ignore else */
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 0x1f]
  }
  return result
}
function createChecksum (prefix, data) {
  const bytes = strToBytes(data)
  const pfx = prefixExpand(prefix)
  const values = new Uint8Array(pfx.length + bytes.length + 6)
  values.set(pfx)
  values.set(bytes, pfx.length)
  const poly = polyMod(values) ^ 1
  let checksum = ''
  for (let i = 0; i < 6; i++) {
    checksum += alphabet[(poly >> 5 * (5 - i)) & 31]
  }
  return checksum
}
function polyMod (values) {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (let i = 0; i < values.length; i++) {
    const top = chk >> 25
    chk = (chk & 0x1ffffff) << 5 ^ values[i]
    for (let j = 0; j < 5; j++) {
      chk ^= ((top >> j) & 1)
        ? gen[j]
        : 0
    }
  }
  return chk
}
function prefixExpand (prefix) {
  const res = []
  res[prefix.length] = 0
  for (let i = 0; i < prefix.length; i++) {
    const ord = prefix.charCodeAt(i)
    res[i] = ord >> 5
    res[i + prefix.length + 1] = ord & 31
  }
  return res
}
function strToBytes (str) {
  const bytes = []
  for (const chr of str) {
    bytes.push(alphabet.indexOf(chr))
  }
  return bytes
}
function verifyChecksum (prefix, data) {
  const pfx = prefixExpand(prefix)
  const bytes = strToBytes(data)
  const values = new Uint8Array(pfx.length + bytes.length)
  values.set(pfx)
  values.set(bytes, pfx.length)
  const poly = polyMod(values)
  if (poly !== 1) {
    throw new Error('bech32: invalid checksum')
  }
}
function checkAlphabet (chars) {
  for (const chr of chars) {
    if (alphabet.indexOf(chr) === -1) {
      throw new Error('bech32: invalid character')
    }
  }
}

exports.decode = decode
exports.encode = encode
