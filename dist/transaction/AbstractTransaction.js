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

const array = require('../util/array.js')

/**
 * @class
 * @lends Transaction
 * @private
 */
class AbstractTransaction {
  /**
   * @param {number[]|Uint8Array|Buffer} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   * @private
   */
  constructor (bytes) {
    /**
     * Транзакция в бинарном виде.
     * @type {number[]}
     * @private
     */
    this._bytes = []
    /**
     * Заполоненные свойства.
     * @type {Object}
     * @private
     */
    this._fieldsMap = {}
    array.arrayFill(this._bytes, 150)
    if (bytes !== undefined) {
      if (bytes.length !== 150) {
        throw new Error('incorrect length')
      }
      array.arraySet(this._bytes, bytes)
      this._setFields([
        'version', 'sender', 'recipient', 'value', 'prefix',
        'name', 'profitPercent', 'feePercent', 'nonce', 'signature'
      ])
    }
  }

  /**
   * Genesis-транзакция.
   * Может быть добавлена только в Genesis-блок.
   * Адрес отправителя должен иметь префикс genesis, адрес получаетеля - umi.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('genesis')
   * let recipient = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.Genesis).
   *   setSender(sender).
   *   setRecipient(recipient).
   *   setValue(42).
   *   sign(secKey)
   */
  static get Genesis () { return 0 }
  /**
   * Стандартная транзакция. Перевод монет из одного кошелька в другой.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let recipient = Address.fromKey(secKey).setPrefix('aaa')
   * let tx = new Transaction().
   *   setVersion(Transaction.Basic).
   *   setSender(sender).
   *   setRecipient(recipient).
   *   setValue(42).
   *   sign(secKey)
   */
  static get Basic () { return 1 }
  /**
   * Создание новой структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.CreateStructure).
   *   setSender(sender).
   *   setPrefix('aaa').
   *   setName('🙂').
   *   setProfitPercent(100).
   *   setFeePercent(0).
   *   sign(secKey)
   */
  static get CreateStructure () { return 2 }
  /**
   * Обновление настроек существующей структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateStructure).
   *   setSender(sender).
   *   setPrefix('aaa').
   *   setName('🙂').
   *   setProfitPercent(500).
   *   setFeePercent(2000).
   *   sign(secKey)
   */
  static get UpdateStructure () { return 3 }
  /**
   * Изменение адреса для начисления профита.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newPrf = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateProfitAddress).
   *   setSender(sender).
   *   setRecipient(newPrf).
   *   sign(secKey)
   */
  static get UpdateProfitAddress () { return 4 }
  /**
   * Изменение адреса на который переводоится комиссия.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newFee = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateFeeAddress).
   *   setSender(sender).
   *   setRecipient(newFee).
   *   sign(secKey)
   */
  static get UpdateFeeAddress () { return 5 }
  /**
   * Активация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.CreateTransitAddress).
   *   setSender(sender).
   *   setRecipient(transit).
   *   sign(secKey)
   */
  static get CreateTransitAddress () { return 6 }
  /**
   * Деактивация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.DeleteTransitAddress).
   *   setSender(sender).
   *   setRecipient(transit).
   *   sign(secKey)
   */
  static get DeleteTransitAddress () { return 7 }
  /**
   * Проверить наличие свойства.
   * @param {string[]} fields
   * @throws {Error}
   * @private
   */
  _checkFields (fields) {
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(this._fieldsMap, field)) {
        throw new Error(`${field} must be set`)
      }
    }
  }

  /**
   * Отметить свойство как установленное.
   * @param {string[]} fields
   * @private
   */
  _setFields (fields) {
    for (const field of fields) {
      this._fieldsMap[field] = true
    }
  }
}

exports.AbstractTransaction = AbstractTransaction
