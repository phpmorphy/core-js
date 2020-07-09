/// <reference types="node" />
/**
 * Базовый класс для работы с адресами.
 * @class
 */
export declare class Address {
    /**
     * Версия Genesis-адреса.
     * @type {number}
     * @constant
     */
    static Genesis: number;
    /**
     * Версия Umi-адреса.
     * @type {number}
     * @constant
     */
    static Umi: number;
    constructor();
    /**
     * Версия адреса, префикс в числовом виде.
     * @returns {number}
     */
    getVersion(): number;
    /**
     * Устанавливает версию адреса и возвращает this.
     * @param {number} version Версия адреса.
     * @returns {Address}
     * @throws {Error}
     */
    setVersion(version: number): this;
    /**
     * Публичный ключ.
     * @returns {PublicKey}
     */
    getPublicKey(): PublicKey;
    /**
     * Устанавливает публичный ключи и возвращает this.
     * @param {PublicKey} publicKey Публичный ключ.
     * @returns {Address}
     * @throws {Error}
     */
    setPublicKey(publicKey: PublicKey): this;
    /**
     * Префикс адреса, три символа латиницы в нижнем регистре.
     * @returns {string}
     */
    getPrefix(): string;
    /**
     * Устанавливает префикс адреса и возвращает this.
     * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
     * @returns {Address}
     * @throws {Error}
     */
    setPrefix(prefix: string): this;
    /**
     * Адрес в формате Bech32, длина 62 символа.
     * @returns {string}
     */
    toBech32(): string;
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @returns {number[]}
     */
    toBytes(): number[];
    /**
     * @param {number[]|Uint8Array|Buffer} bytes
     * @returns {Address}
     * @throws {Error}
     */
    static fromBytes(bytes: number[] | Uint8Array | Buffer): Address;
    /**
     * Статический метод, создает объект из адреса в формате Bech32.
     * @param {string} bech32 Адрес в формате Bech32, длина 62 или 65 символов.
     * @returns {Address}
     * @throws {Error}
     */
    static fromBech32(bech32: string): Address;
    /**
     * Статический метод, создает объект из публичного или приватного ключа.
     * @param {PublicKey|SecretKey} key Публичный или приватный ключ.
     * @returns {Address}
     */
    static fromKey(key: PublicKey | SecretKey): Address;
}
/**
 * Базовый класс для работы с блоками.
 * @class
 */
export declare class Block {
}
/**
 * Базовый класс для работы с заголовками блоков.
 * @class
 */
export declare class BlockHeader {
}
/**
 * Базовый класс для работы с публичными ключами.
 * @class
 */
export declare class PublicKey {
    /**
     * @param {number[]|Uint8Array|Buffer} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
     * @throws {Error}
     */
    constructor(bytes: number[] | Uint8Array | Buffer);
    /**
     * Публичный ключ в формате libsodium, 32 байта (256 бит).
     * @returns {number[]}
     */
    toBytes(): number[];
    /**
     * Публичный ключ.
     * @returns {PublicKey}
     */
    getPublicKey(): this;
    /**
     * Проверяет цифровую подпись.
     * @param {number[]|Uint8Array|Buffer} signature Подпись, 64 байта.
     * @param {number[]|Uint8Array|Buffer} message Сообщение
     * @returns {boolean}
     * @throws {Error}
     * @example
     * let key = new Uint8Array(32)
     * let sig = new Uint8Array(64)
     * let msg = new Uint8Array(1)
     * let ver = new PublicKey(key).verifySignature(sig, msg)
     */
    verifySignature(signature: number[] | Uint8Array | Buffer, message: number[] | Uint8Array | Buffer): boolean;
}
/**
 * Базовый класс для работы с приватными ключами.
 * @class
 */
export declare class SecretKey {
    /**
     * @param {number[]|Uint8Array|Buffer} bytes Приватный ключ в бинарном виде.
     * В формате libsodium, 64 байта (512 бит).
     * @throws {Error}
     */
    constructor(bytes: number[] | Uint8Array | Buffer);
    /**
     * Приватный ключ в бинарном виде. В формате libsodium, 64 байта (512 бит).
     * @returns {number[]}
     */
    toBytes(): number[];
    /**
     * Публичный ключ, соответствующий приватному ключу.
     * @returns {PublicKey}
     */
    getPublicKey(): PublicKey;
    /**
     * Создает цифровую подпись сообщения.
     * @param {number[]|Uint8Array|Buffer} message Сообщение, которое необходимо подписать.
     * @returns {number[]} Цифровая подпись длиной 64 байта (512 бит).
     * @example
     * let seed = new Uint8Array(32)
     * let msg = new Uint8Array(1)
     * let sig = SecretKey.fromSeed(seed).sign(msg)
     */
    sign(message: number[] | Uint8Array | Buffer): number[];
    /**
     * Статический фабричный метод, создающий приватный ключ из seed.
     * Libsodium принимает seed длиной 32 байта (256 бит), если длина
     * отличается, то берется sha256 хэш.
     * @param {number[]|Uint8Array|Buffer} seed Seed длиной от 0 до 128 байт.
     * @returns {SecretKey}
     * @example
     * let seed = new Uint8Array(32)
     * let key = SecretKey.fromSeed(seed)
     */
    static fromSeed(seed: number[] | Uint8Array | Buffer): SecretKey;
}
/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]|Uint8Array|Buffer} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
export declare class Transaction {
    /**
     * Genesis-транзакция.
     * Может быть добавлена только в Genesis-блок.
     * Адрес отправителя должен иметь префикс genesis, адрес получателя - umi.
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
    static Genesis: number;
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
    static Basic: number;
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
    static CreateStructure: number;
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
    static UpdateStructure: number;
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
    static UpdateProfitAddress: number;
    /**
     * Изменение адреса на который переводится комиссия.
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
    static UpdateFeeAddress: number;
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
    static CreateTransitAddress: number;
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
    static DeleteTransitAddress: number;
    /**
     * Транзакция в бинарном виде, 150 байт.
     * @returns {number[]}
     */
    toBytes(): number[];
    /**
     * Транзакция в виде строки в формате Base64.
     * @returns {string}
     */
    toBase64(): string;
    /**
     * Хэш транзакции, sha256 от всех 150 байт.
     * @returns {number[]}
     */
    getHash(): number[];
    /**
     * Версия (тип) транзакции.
     * Обязательное поле, необходимо задать сразу после создания новой транзакции.
     * Изменять тип транзакции, после того как он был задан, нельзя.
     * @returns {number}
     * @see Transaction.Genesis
     * @see Transaction.Basic
     * @see Transaction.CreateStructure
     * @see Transaction.UpdateStructure
     * @see Transaction.UpdateProfitAddress
     * @see Transaction.UpdateFeeAddress
     * @see Transaction.CreateTransitAddress
     * @see Transaction.DeleteTransitAddress
     */
    getVersion(): number;
    /**
     * Устанавливает версию и возвращает this.
     * @param {number} version Версия адреса.
     * @returns {Transaction}
     * @throws {Error}
     * @see Transaction.Genesis
     * @see Transaction.Basic
     * @see Transaction.CreateStructure
     * @see Transaction.UpdateStructure
     * @see Transaction.UpdateProfitAddress
     * @see Transaction.UpdateFeeAddress
     * @see Transaction.CreateTransitAddress
     * @see Transaction.DeleteTransitAddress
     */
    setVersion(version: number): this;
    /**
     * Отправитель. Доступно для всех типов транзакций.
     * @returns {Address}
     */
    getSender(): Address;
    /**
     * Устанавливает отправителя и возвращает this.
     * @param {Address} address Адрес получателя.
     * @returns {Transaction}
     * @throws {Error}
     */
    setSender(address: Address): this;
    /**
     * Получатель.
     * Недоступно для транзакций CreateStructure и UpdateStructure.
     * @returns {Address}
     */
    getRecipient(): Address;
    /**
     * Устанавливает получателя и возвращает this.
     * Доступно для всех типов транзакций кроме CreateStructure и UpdateStructure.
     * @param {Address} address Адрес получателя.
     * @returns {Transaction}
     * @throws {Error}
     */
    setRecipient(address: Address): this;
    /**
     * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.
     * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
     * Доступно только для Genesis и Basic транзакций.
     * @returns {number}
     */
    getValue(): number;
    /**
     * Устанавливает сумму и возвращает this.
     * Принимает значения в промежутке от 1 до 18446744073709551615.
     * Доступно только для Genesis и Basic транзакций.
     * @param {number} value
     * @returns {Transaction}
     * @throws {Error}
     */
    setValue(value: number): this;
    /**
     * Nonce, целое число в промежутке от 0 до 18446744073709551615.
     * Генерируется автоматически при вызове sign().
     * @returns {number}
     */
    getNonce(): number;
    /**
     * Устанавливает nonce и возвращает this.
     * @param {number} nonce Nonce, целое число в промежутке от 0 до 18446744073709551615.
     * @returns {Transaction}
     * @throws {Error}
     */
    setNonce(nonce: number): this;
    /**
     * Цифровая подпись транзакции, длина 64 байта.
     * Генерируется автоматически при вызове sign().
     * @returns {number[]}
     */
    getSignature(): number[] | Uint8Array | Buffer;
    /**
     * Устанавливает цифровую подпись и возвращает this.
     * @param {number[]|Uint8Array|Buffer} signature Подпись, длина 64 байта.
     * @returns {Transaction}
     * @throws {Error}
     */
    setSignature(signature: number[] | Uint8Array | Buffer): this;
    /**
     * Подписать транзакцию приватным ключом.
     * @param {SecretKey} secretKey
     * @returns {Transaction}
     * @throws {Error}
     */
    sign(secretKey: SecretKey): this;
    /**
     * Проверить транзакцию на соответствие формальным правилам.
     * @returns {boolean}
     * @throws {Error}
     */
    verify(): boolean;
    /**
     * Префикс адресов, принадлежащих структуре.
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {string}
     * @returns {Error}
     */
    getPrefix(): string;
    /**
     * Устанавливает префикс и возвращает this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} prefix Префикс адресов, принадлежащих структуре.
     * @returns {Transaction}
     * @throws {Error}
     */
    setPrefix(prefix: string): this;
    /**
     * Название структуры в кодировке UTF-8.
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {string}
     * @throws {Error}
     */
    getName(): string;
    /**
     * Устанавливает название структуры.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} name Название структуры в кодировке UTF-8.
     * @returns {Transaction}
     * @throws {Error}
     */
    setName(name: string): this;
    /**
     * Профита в сотых долях процента с шагом в 0.01%.
     * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {number}
     */
    getProfitPercent(): number;
    /**
     * Устанавливает процент профита и возвращает this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Профит в сотых долях процента с шагом в 0.01%.
     * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
     * @returns {Transaction}
     * @throws {Error}
     */
    setProfitPercent(percent: number): this;
    /**
     * Комиссия в сотых долях процента с шагом в 0.01%.
     * Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {number}
     */
    getFeePercent(): number;
    /**
     * Устанавливает размер комиссии и возвращает this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
     * @returns {Transaction}
     * @throws {Error}
     */
    setFeePercent(percent: number): this;
    /**
     * Статический метод, создает объект из Base64 строки.
     * @param {string} base64
     * @returns {Transaction}
     * @throws {Error}
     */
    static fromBase64(base64: string): Transaction;
    /**
     * @param {number[]|Uint8Array|Buffer} bytes
     * @returns {Transaction}
     * @throws {Error}
     */
    static fromBytes(bytes: number[] | Uint8Array | Buffer): Transaction;
}
