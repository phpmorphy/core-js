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

const Converter = require('./Converter.js')

/**
 * Конвертер адресов в формате Bech32.
 * @class
 * @private
 */
class Bech32 {
  /**
   * @type {string}
   * @private
   */
  static get _alphabet () { return 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' }
  /**
   * @param {string} bech32
   * @returns {Uint8Array}
   * @throws {Error}
   */
  static decode (bech32) {
    if (bech32.length !== 62 && bech32.length !== 66) {
      throw new Error('bech32: invalid length')
    }
    const str = bech32.toLowerCase()
    const sepPos = str.lastIndexOf('1')
    if (sepPos === -1) {
      throw new Error('bech32: missing separator')
    }
    const pfx = str.slice(0, sepPos)
    const ver = Converter.prefixToVersion(pfx)
    const data = str.slice(sepPos + 1)
    this._checkAlphabet(data)
    this._verifyChecksum(pfx, data)
    const res = new Uint8Array(34)
    res.set(this._convert5to8(data.slice(0, -6)), 2)
    new DataView(res.buffer).setUint16(0, ver)
    return res
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {string}
   * @throws {Error}
   */
  static encode (bytes) {
    const version = (bytes[0] << 8) + bytes[1]
    const prefix = Converter.versionToPrefix(version)
    const data = this._convert8to5(bytes.subarray(2))
    const checksum = this._createChecksum(prefix, data)
    return prefix + '1' + data + checksum
  }

  /**
   * @param {string} chars
   * @throws {Error}
   * @private
   */
  static _checkAlphabet (chars) {
    for (const chr of chars) {
      if (this._alphabet.indexOf(chr) === -1) {
        throw new Error('bech32: invalid character')
      }
    }
  }

  /**
   * @param {string} data
   * @return {Uint8Array}
   * @private
   */
  static _convert5to8 (data) {
    let value = 0
    let bits = 0
    const bytes = this._strToBytes(data)
    const result = []
    for (let i = 0; i < bytes.byteLength; i++) {
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
    return new Uint8Array(result)
  }

  /**
   * @param {Uint8Array} data
   * @return {string}
   * @private
   */
  static _convert8to5 (data) {
    let value = 0
    let bits = 0
    let result = ''
    for (let i = 0; i < data.byteLength; i++) {
      value = (value << 8) | data[i]
      bits += 8
      while (bits >= 5) {
        bits -= 5
        result += this._alphabet[(value >> bits) & 0x1f]
      }
    }
    /* istanbul ignore else */
    if (bits > 0) {
      result += this._alphabet[(value << (5 - bits)) & 0x1f]
    }
    return result
  }

  /**
   * @param {string} prefix
   * @param {string} data
   * @private
   */
  static _createChecksum (prefix, data) {
    const bytes = this._strToBytes(data)
    const pfx = this._prefixExpand(prefix)
    const values = new Uint8Array(pfx.byteLength + bytes.byteLength + 6)
    values.set(pfx)
    values.set(bytes, pfx.byteLength)
    const polyMod = this._polyMod(values) ^ 1
    let checksum = ''
    for (let i = 0; i < 6; i++) {
      checksum += this._alphabet[(polyMod >> 5 * (5 - i)) & 31]
    }
    return checksum
  }

  /**
   * @param {Uint8Array} values
   * @return {number}
   * @private
   */
  static _polyMod (values) {
    const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    let chk = 1
    for (let i = 0; i < values.byteLength; i++) {
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

  /**
   * @param {Uint8Array} prefix
   * @throws {Uint8Array}
   * @private
   */
  static _prefixExpand (prefix) {
    const res = new Uint8Array((prefix.length * 2) + 1)
    for (let i = 0; i < prefix.length; i++) {
      const ord = prefix.charCodeAt(i)
      res[i] = ord >> 5
      res[i + prefix.length + 1] = ord & 31
    }
    return res
  }

  /**
   * @param {string} str
   * @throws {Error}
   * @private
   */
  static _strToBytes (str) {
    const bytes = []
    for (const chr of str) {
      bytes.push(this._alphabet.indexOf(chr))
    }
    return new Uint8Array(bytes)
  }

  /**
   * @param {string} prefix
   * @param {string} data
   * @private
   */
  static _verifyChecksum (prefix, data) {
    const pfx = this._prefixExpand(prefix)
    const bytes = this._strToBytes(data)
    const values = new Uint8Array(pfx.byteLength + bytes.byteLength)
    values.set(pfx)
    values.set(bytes, pfx.byteLength)
    const poly = this._polyMod(values)
    if (poly !== 1) {
      throw new Error('bech32: invalid checksum')
    }
  }
}

exports.Bech32 = Bech32
