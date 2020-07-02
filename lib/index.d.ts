/// <reference types="node" />
/**
 * Базовый класс для работы с адресами.
 * @class
 */
export declare class Address {
    /**
     * Версия Genesis-адрса.
     * @type {number}
     * @constant
     */
    static get Genesis(): number;
    /**
     * Версия Umi-адреса.
     * @type {number}
     * @constant
     */
    static get Umi(): number;
    /**
     * @param {number[]|Uint8Array} [bytes] Адрес в бинарном виде, длина 34 байта.
     * @throws {Error}
     */
    constructor(bytes?: number[] | Uint8Array | Buffer);
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @type {number[]}
     * @readonly
     */
    get bytes(): number[];
    /**
     * Версия адреса, префикс в числовом виде.
     * @type {number}
     * @throws {Error}
     */
    get version(): number;
    set version(version: number);
    /**
     * Устанавливает версию адреса и возвращяет this.
     * @param {number} version Версия адреса.
     * @returns {Address}
     * @throws {Error}
     */
    setVersion(version: number): Address;
    /**
     * Публичный ключ.
     * @type {PublicKey}
     * @throws {Error}
     */
    get publicKey(): PublicKey;
    set publicKey(publicKey: PublicKey);
    /**
     * Устанавливает публичный ключи и возвращяет this.
     * @param {PublicKey} publicKey Публичный ключ.
     * @returns {Address}
     * @throws {Error}
     */
    setPublicKey(publicKey: PublicKey): Address;
    /**
     * Префикс адреса, три символа латиницы в нижнем регистре.
     * @type {string}
     * @throws {Error}
     */
    get prefix(): string;
    set prefix(prefix: string);
    /**
     * Устанавливает префикс адреса и возвращяет this.
     * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
     * @returns {Address}
     * @throws {Error}
     */
    setPrefix(prefix: string): Address;
    /**
     * Адрес в формате Bech32, длина 62 символа.
     * @type {string}
     * @throws {Error}
     */
    get bech32(): string;
    set bech32(bech32: string);
    /**
     * Устанавливает адрес в формате Bech32.
     * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
     * @returns {Address}
     * @throws {Error}
     */
    setBech32(bech32: string): Address;
    /**
     * Статический фабричный метод, создающий объект из адреса в формате Bech32.
     * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
     * @returns {Address}
     * @throws {Error}
     */
    static fromBech32(bech32: string): Address;
    /**
     * Статический фабричный метод, создающий объект из публичного или приватного ключа.
     * @param {PublicKey|SecretKey} key Публичный или приватный ключ.
     * @returns {Address}
     * @throws {Error}
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
     * Длина публичного ключа в формате libsodium в байтах.
     * @type {number}
     * @constant
     */
    static get LENGTH(): number;
    /**
     * Длина цифровой подписи в байтах.
     * @type {number}
     * @constant
     */
    static get SIGNATURE_LENGTH(): number;
    /**
     * Длина цифровой подписи в байтах.
     * @type {number}
     * @constant
     */
    get signatureLength(): number;
    /**
     * @param {number[]} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
     * @throws {Error}
     */
    constructor(bytes: number[] | Uint8Array | Buffer);
    /**
     * Публичный ключ в формате libsodium, 32 байта (256 бит).
     * @type {number[]}
     * @readonly
     */
    get bytes(): number[];
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
     * @type {number[]}
     * @readonly
     */
    get bytes(): number[];
    /**
     * Публичный ключ, соответствующий приватному ключу.
     * @type {PublicKey}
     * @readonly
     */
    get publicKey(): PublicKey;
    /**
     * Создает цифровую подпись сообщения.
     * @param {number[]|Uint8Array|Buffer} message Сообщение, которое необходимо подписать.
     * @returns {number[]} Цифровая подпись длиной 64 байта (512 бит).
     * @throws {Error}
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
     * @throws {Error}
     * @example
     * let seed = new Uint8Array(32)
     * let key = SecretKey.fromSeed(seed)
     */
    static fromSeed(seed: number[] | Uint8Array | Buffer): SecretKey;
}
/**
 * @class
 * @lends Transaction
 * @private
 */
declare abstract class AbstractTransaction {
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
    static get Genesis(): number;
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
    static get Basic(): number;
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
    static get CreateStructure(): number;
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
    static get UpdateStructure(): number;
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
    static get UpdateProfitAddress(): number;
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
    static get UpdateFeeAddress(): number;
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
    static get CreateTransitAddress(): number;
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
    static get DeleteTransitAddress(): number;
    /**
     * @param {number[]|Uint8Array|Buffer} [bytes] Транзакция в бинарном виде, 150 байт.
     * @throws {Error}
     * @private
     */
    protected constructor(bytes?: number[] | Uint8Array | Buffer);
}
/**
 * Базовый класс для работы с транзакциями.
 * @class
 * @lends Transaction
 * @private
 */
declare abstract class AbstractTransactionBase extends AbstractTransaction {
    /**
     * Транзакция в бинарном виде, 150 байт.
     * @type {number[]}
     * @readonly
     */
    get bytes(): number[];
    /**
     * Хэш транзакции, sha256 от всех 150 байт.
     * @type {number[]}
     * @readonly
     */
    get hash(): number[];
    /**
     * Версия (тип) транзакции.
     * Обязательное поле, необходимо задать сразу после создания новой транзакции.
     * Изменять тип транзакции, после того как он был задан, нельзя.
     * @type {number}
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
    get version(): number;
    set version(version: number);
    /**
     * Устанавливает версию и возвращяет this.
     * @param {number} version Версия адреса.
     * @returns {this}
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
     * @type {Address}
     * @throws {Error}
     */
    get sender(): Address;
    set sender(address: Address);
    /**
     * Устанавливает отправителя и возвращяет this.
     * @param {Address} address Адрес получателя.
     * @returns {this}
     * @throws {Error}
     */
    setSender(address: Address): this;
    /**
     * Получатель.
     * Недоступно для транзакций CreateStructure и UpdateStructure.
     * @type {Address}
     * @throws {Error}
     */
    get recipient(): Address;
    set recipient(address: Address);
    /**
     * Устанавливает получателя и возвращяет this.
     * Доступно для всех типов транзакций кроме CreateStructure и UpdateStructure.
     * @param {Address} address Адрес получателя.
     * @returns {this}
     * @throws {Error}
     */
    setRecipient(address: Address): this;
    /**
     * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.
     * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
     * Доступно только для Genesis и Basic транзакций.
     * @type {number}
     * @throws {Error}
     */
    get value(): number;
    set value(value: number);
    /**
     * Устанавливает сумму и возвращяет this.
     * Принимает значения в промежутке от 1 до 9007199254740991.
     * Доступно только для Genesis и Basic транзакций.
     * @param {number} value
     * @returns {this}
     * @throws {Error}
     */
    setValue(value: number): this;
    /**
     * Nonce, целое число в промежутке от 0 до 18446744073709551615.
     * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
     * Генерируется автоматичеки при вызове sign().
     * @type {number}
     * @throws {Error}
     */
    get nonce(): number;
    set nonce(nonce: number);
    /**
     * Устанавливает nonce и возвращяет this.
     * @param {number} nonce Nonce, целое числов промежутке от 0 до 9007199254740991.
     * @returns {this}
     * @throws {Error}
     */
    setNonce(nonce: number): this;
    /**
     * Цифровая подпись транзакции, длина 64 байта.
     * Генерируется автоматически при вызове sign().
     * @type {number[]}
     * @throws {Error}
     */
    get signature(): number[] | Uint8Array | Buffer;
    set signature(signature: number[] | Uint8Array | Buffer);
    /**
     * Устанавливает цифровую подпись и возвращяет this.
     * @param {number[]|Uint8Array|Buffer} signature Подпись, длина 64 байта.
     * @returns {this}
     * @throws {Error}
     */
    setSignature(signature: number[] | Uint8Array | Buffer): this;
    /**
     * Подписать транзакцию приватным ключем.
     * @param {SecretKey} secretKey
     * @returns {this}
     * @throws {Error}
     */
    sign(secretKey: SecretKey): this;
    /**
     * Проверить транзакцию на соотвествие формальным правилам.
     * @returns {boolean}
     * @throws {Error}
     */
    verify(): boolean;
}
/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
export declare class Transaction extends AbstractTransactionBase {
    /**
     * Префикс адресов, принадлежащих структуре.
     * Доступно только для CreateStructure и UpdateStructure.
     * @type {string}
     * @throws {Error}
     */
    get prefix(): string;
    set prefix(prefix: string);
    /**
     * Устанавливает префикс и возвращяет this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} prefix Префикс адресов, принадлежащих структуре.
     * @returns {this}
     * @throws {Error}
     */
    setPrefix(prefix: string): this;
    /**
     * Название структуры в кодировке UTF-8.
     * Доступно только для CreateStructure и UpdateStructure.
     * @type {string}
     * @throws {Error}
     */
    get name(): string;
    set name(name: string);
    /**
     * Устанавливает название структуры.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} name Название структуры в кодировке UTF-8.
     * @returns {this}
     * @throws {Error}
     */
    setName(name: string): this;
    /**
     * Профита в сотых долях процента с шагом в 0.01%.
     * Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
     * Доступно только для CreateStructure и UpdateStructure.
     * @type {number}
     * @throws {Error}
     */
    get profitPercent(): number;
    set profitPercent(percent: number);
    /**
     * Устанавливает процент профита и возвращяет this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Профит в сотых долях процента с шагом в 0.01%. Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
     * @returns {this}
     * @throws {Error}
     */
    setProfitPercent(percent: number): this;
    /**
     * Комиссия в сотых долях процента с шагом в 0.01%.
     * Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
     * Доступно только для CreateStructure и UpdateStructure.
     * @type {number}
     * @throws {Error}
     */
    get feePercent(): number;
    set feePercent(percent: number);
    /**
     * Устанавливает размер комиссии и возвращает this.
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
     * @returns {this}
     * @throws {Error}
     */
    setFeePercent(percent: number): this;
}
export {};
