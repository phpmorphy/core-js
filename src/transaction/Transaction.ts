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

import { AbstractTransaction } from './AbstractTransaction'
import { versionToPrefix, prefixToVersion } from '../util/converter'
import { Utf8Decode, Utf8Encode } from '../util/utf8'
import { validateInt } from '../util/validator'
import { bytesToUint16, uint16ToBytes } from '../util/integer'
import { arrayNew, arraySet } from '../util/array'
import { base64Decode } from '../util/base64'

/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]|Uint8Array|Buffer} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
export class Transaction extends AbstractTransaction {
  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   */
  get prefix (): string {
    return versionToPrefix(bytesToUint16(this._bytes.slice(35, 37)))
  }

  set prefix (prefix: string) {
    arraySet(this._bytes, uint16ToBytes(prefixToVersion(prefix)), 35)
  }

  /**
   * Устанавливает префикс и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {Transaction}
   * @throws {Error}
   */
  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   */
  get name (): string {
    if (this._bytes[41] > 35) {
      throw new Error('invalid length')
    }
    return Utf8Decode(this._bytes.slice(42, 42 + this._bytes[41]))
  }

  set name (name: string) {
    const bytes = Utf8Encode(name)
    if (bytes.length > 35) {
      throw new Error('name is too long')
    }
    arraySet(this._bytes, arrayNew(36), 41) // wipe
    arraySet(this._bytes, bytes, 42)
    this._bytes[41] = bytes.length
  }

  /**
   * Устанавливает название структуры.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {Transaction}
   * @throws {Error}
   */
  setName (name: string): this {
    this.name = name
    return this
  }

  /**
   * Профита в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   */
  get profitPercent (): number {
    return bytesToUint16(this._bytes.slice(37, 39))
  }

  set profitPercent (percent: number) {
    validateInt(percent, 100, 500)
    arraySet(this._bytes, uint16ToBytes(percent), 37)
  }

  /**
   * Устанавливает процент профита и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setProfitPercent (percent: number): this {
    this.profitPercent = percent
    return this
  }

  /**
   * Комиссия в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   */
  get feePercent (): number {
    return bytesToUint16(this._bytes.slice(39, 41))
  }

  set feePercent (percent: number) {
    validateInt(percent, 0, 2000)
    arraySet(this._bytes, uint16ToBytes(percent), 39)
  }

  /**
   * Устанавливает размер комиссии и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setFeePercent (percent: number): this {
    this.feePercent = percent
    return this
  }

  /**
   * Статический метод, создает объект из Base64 строки.
   * @param {string} base64
   * @returns {Transaction}
   * @throws {Error}
   */
  static fromBase64 (base64: string): Transaction {
    if (base64.length !== 200) {
      throw new Error('invalid length')
    }
    return new Transaction(base64Decode(base64))
  }
}
