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

const validator = require('../util/validator.js')
const converter = require('../util/converter.js')
const utf8 = require('../util/utf8.js')
const AbstractTransactionBase = require('./AbstractTransactionBase.js')

/**
 * Класс для работы с транзакциями.
 * @class
 * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
class Transaction extends AbstractTransactionBase.AbstractTransactionBase {
  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsStruct () {
    const versions = [Transaction.CreateStructure, Transaction.UpdateStructure]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get prefix () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['prefix'])
    return converter.versionToPrefix(this._view.getUint16(35))
  }

  set prefix (prefix) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._view.setUint16(35, converter.prefixToVersion(prefix))
    this._setFields(['prefix'])
  }

  /**
   * Устанавливает префикс и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {this}
   * @throws {Error}
   */
  setPrefix (prefix) {
    this.prefix = prefix
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get name () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['name'])
    const txt = this._bytes.subarray(41 + 1, 41 + 1 + this._bytes[41])
    return utf8.Utf8Decode(txt)
  }

  set name (name) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }
    const txt = utf8.Utf8Encode(name)
    if (txt.byteLength >= 36) {
      throw new Error('name is too long')
    }
    this._bytes[41] = txt.byteLength
    this._bytes.set(txt, 41 + 1)
    this._setFields(['name'])
  }

  /**
   * Устанавливает название структуры.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {this}
   * @throws {Error}
   */
  setName (name) {
    this.name = name
    return this
  }

  /**
   * Профита в сотых долях процента с шагом в 0.01%.
   * Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   * @throws {Error}
   */
  get profitPercent () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['profitPercent'])
    return this._view.getUint16(37)
  }

  set profitPercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validator.validateInt(percent, 100, 500)
    this._view.setUint16(37, percent)
    this._setFields(['profitPercent'])
  }

  /**
   * Устанавливает процент профита и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%. Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
   * @returns {this}
   * @throws {Error}
   */
  setProfitPercent (percent) {
    this.profitPercent = percent
    return this
  }

  /**
   * Комиссия в сотых долях процента с шагом в 0.01%.
   * Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   * @throws {Error}
   */
  get feePercent () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['feePercent'])
    return this._view.getUint16(39)
  }

  set feePercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validator.validateInt(percent, 0, 2000)
    this._view.setUint16(39, percent)
    this._setFields(['feePercent'])
  }

  /**
   * Устанавливает размер комисии и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
   * @returns {this}
   * @throws {Error}
   */
  setFeePercent (percent) {
    this.feePercent = percent
    return this
  }
}

exports.Transaction = Transaction
