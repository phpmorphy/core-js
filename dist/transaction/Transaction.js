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
const AbstractTransaction = require('./AbstractTransaction.js')

/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
class Transaction extends AbstractTransaction.AbstractTransaction {
  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get prefix () {
    const ver = (this._bytes[35] << 8) + this._bytes[36]
    return converter.versionToPrefix(ver)
  }

  set prefix (prefix) {
    const ver = converter.prefixToVersion(prefix)
    this._bytes[35] = (ver >>> 8) & 0xff
    this._bytes[36] = ver & 0xff
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
    const txt = this._bytes.slice(42, 42 + this._bytes[41])
    return utf8.Utf8Decode(txt)
  }

  set name (name) {
    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }
    const txt = utf8.Utf8Encode(name)
    if (txt.length >= 36) {
      throw new Error('name is too long')
    }
    this._bytes[41] = txt.length
    for (let i = 0; i < 35; i++) {
      this._bytes[42 + i] = txt[i] || 0
    }
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
    return (this._bytes[37] << 8) + this._bytes[38]
  }

  set profitPercent (percent) {
    validator.validateInt(percent, 100, 500)
    this._bytes[37] = (percent >>> 8) & 0xff
    this._bytes[38] = percent & 0xff
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
    return (this._bytes[39] << 8) + this._bytes[40]
  }

  set feePercent (percent) {
    validator.validateInt(percent, 0, 2000)
    this._bytes[39] = (percent >>> 8) & 0xff
    this._bytes[40] = percent & 0xff
  }

  /**
   * Устанавливает размер комиссии и возвращает this.
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
