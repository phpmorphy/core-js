/**
 * Класс для работы с адресами.
 * @class
 */
export declare class Address {
    /**
     * @example
     * let address = new Address()
     */
    constructor();
    /**
     * Статический метод, создает объект из адреса в формате Bech32.
     * @param {string} bech32 Адрес в формате Bech32, длина 62 или 65 символов.
     * @returns {Address}
     * @throws {Error}
     * @example
     * let address = Address.fromBech32('umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6')
     */
    static fromBech32(bech32: string): Address;
    /**
     * Статический метод, создает объект из бинарного представления.
     * @param {ArrayLike<number>} bytes Адрес в бинарном виде, длина 34 байта.
     * @returns {Address}
     * @throws {Error}
     * @example
     * let address = Address.fromBytes(new Uint8Array(34))
     */
    static fromBytes(bytes: ArrayLike<number>): Address;
    /**
     * Статический метод, создает объект из публичного или приватного ключа.
     * @param {(PublicKey|SecretKey)} key Публичный или приватный ключ.
     * @returns {Address}
     * @example
     * let secKey = SecretKey.fromSeed([])
     * let address = Address.fromKey(secKey)
     */
    static fromKey(key: PublicKey | SecretKey): Address;
    /**
     * Адрес в формате Bech32, длина 62 или 65 символов.
     * @returns {string}
     * @example
     * let bech32 = new Address().getBech32()
     */
    getBech32(): string;
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @returns {number[]}
     * @example
     * let bytes = new Address().getBytes()
     */
    getBytes(): number[];
    /**
     * Префикс адреса, три символа латиницы в нижнем регистре.
     * @returns {string}
     * @throws {Error}
     * @example
     * let prefix = new Address().getPrefix()
     */
    getPrefix(): string;
    /**
     * Устанавливает префикс адреса и возвращает this.
     * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
     * @returns {Address}
     * @throws {Error}
     * @example
     * let address = new Address().setPrefix('umi')
     */
    setPrefix(prefix: string): Address;
    /**
     * Публичный ключ.
     * @returns {PublicKey}
     * @example
     * let pubKey = new Address().getPublicKey()
     */
    getPublicKey(): PublicKey;
    /**
     * Устанавливает публичный ключ и возвращает this.
     * @param {PublicKey} publicKey Публичный ключ.
     * @returns {Address}
     * @throws {Error}
     * @example
     * let pubKey = SecretKey.fromSeed([]).getPublicKey()
     * let address = new Address().setPublicKey(pubKey)
     */
    setPublicKey(publicKey: PublicKey): Address;
}
/**
 * Класс для работы с публичными ключами.
 * @class
 */
export declare class PublicKey {
    /**
     * @param {ArrayLike<number>} bytes Публичный ключ в формате libsodium, 32 байта.
     * @throws {Error}
     * @example
     * let bytes = new Uint8Array(32)
     * let pubKey = new PublicKey(bytes)
     */
    constructor(bytes: ArrayLike<number>);
    /**
     * Публичный ключ в формате libsodium, 32 байта.
     * @returns {number[]}
     * @example
     * let bytes = new PublicKey(new Uint8Array(32)).getBytes()
     */
    getBytes(): number[];
    /**
     * Проверяет цифровую подпись.
     * @param {ArrayLike<number>} signature Подпись, 64 байта.
     * @param {ArrayLike<number>} message Сообщение.
     * @returns {boolean}
     * @throws {Error}
     * @example
     * let pubKey = new PublicKey(new Uint8Array(32))
     * let signature = new Uint8Array(64)
     * let message = new TextEncoder().encode('Hello World')
     * let isValid = pubKey.verifySignature(signature, message)
     */
    verifySignature(signature: ArrayLike<number>, message: ArrayLike<number>): boolean;
}
/**
 * Класс для работы с приватными ключами.
 * @class
 */
export declare class SecretKey {
    /**
     * @param {ArrayLike<number>} bytes Приватный ключ в бинарном виде.
     * В формате libsodium, 64 байта.
     * @throws {Error}
     * @example
     * let bytes = SecretKey.fromSeed(new Uint8Array(32)).getBytes()
     * let secKey = new SecretKey(bytes)
     */
    constructor(bytes: ArrayLike<number>);
    /**
     * Статический метод, создающий приватный ключ из seed.\
     * Libsodium принимает seed длиной 32 байта, поэтому если длина
     * отличается, то берется sha256 хэш.
     * @param {ArrayLike<number>} seed Массив байтов любой длины.
     * @returns {SecretKey}
     * @example
     * let seed = new Uint8Array(32)
     * let secKey = SecretKey.fromSeed(seed)
     */
    static fromSeed(seed: ArrayLike<number>): SecretKey;
    /**
     * Приватный ключ в бинарном виде. В формате libsodium, 64 байта.
     * @returns {number[]}
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let bytes = secKey.getBytes()
     */
    getBytes(): number[];
    /**
     * Публичный ключ, соответствующий приватному ключу.
     * @returns {PublicKey}
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let pubKey = secKey.getPublicKey()
     */
    getPublicKey(): PublicKey;
    /**
     * Создает цифровую подпись сообщения.
     * @param {ArrayLike<number>} message Сообщение, которое необходимо подписать.
     * @returns {number[]} Подпись длиной 64 байта.
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let message = new TextEncoder().encode('Hello World')
     * let signature = secKey.sign(message)
     */
    sign(message: ArrayLike<number>): number[];
}
/**
 * Класс для работы с транзакциями.
 * @class
 */
export declare class Transaction {
    /**
     * Genesis-транзакция.\
     * Может быть добавлена только в Genesis-блок.\
     * Адрес отправителя должен иметь префикс genesis, адрес получателя - umi.
     * @type {number}
     * @constant
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let sender = Address.fromKey(secKey).setPrefix('genesis')
     * let recipient = Address.fromKey(secKey).setPrefix('umi')
     * let tx = new Transaction()
     *   .setVersion(Transaction.Genesis)
     *   .setSender(sender)
     *   .setRecipient(recipient)
     *   .setValue(42)
     *   .sign(secKey)
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
     * let tx = new Transaction()
     *   .setVersion(Transaction.Basic)
     *   .setSender(sender)
     *   .setRecipient(recipient)
     *   .setValue(42)
     *   .sign(secKey)
     */
    static Basic: number;
    /**
     * Создание новой структуры.
     * @type {number}
     * @constant
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let sender = Address.fromKey(secKey).setPrefix('umi')
     * let tx = new Transaction()
     *   .setVersion(Transaction.CreateStructure)
     *   .setSender(sender)
     *   .setPrefix('aaa')
     *   .setName('My Struct 🙂')
     *   .setProfitPercent(100)
     *   .setFeePercent(0)
     *   .sign(secKey)
     */
    static CreateStructure: number;
    /**
     * Обновление настроек существующей структуры.
     * @type {number}
     * @constant
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let sender = Address.fromKey(secKey).setPrefix('umi')
     * let tx = new Transaction()
     *   .setVersion(Transaction.UpdateStructure)
     *   .setSender(sender)
     *   .setPrefix('aaa')
     *   .setName('My New Struct 😎')
     *   .setProfitPercent(500)
     *   .setFeePercent(2000)
     *   .sign(secKey)
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
     * let tx = new Transaction()
     *   .setVersion(Transaction.UpdateProfitAddress)
     *   .setSender(sender)
     *   .setRecipient(newPrf)
     *   .sign(secKey)
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
     * let tx = new Transaction()
     *   .setVersion(Transaction.UpdateFeeAddress)
     *   .setSender(sender)
     *   .setRecipient(newFee)
     *   .sign(secKey)
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
     * let tx = new Transaction()
     *   .setVersion(Transaction.CreateTransitAddress)
     *   .setSender(sender)
     *   .setRecipient(transit)
     *   .sign(secKey)
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
     * let tx = new Transaction()
     *   .setVersion(Transaction.DeleteTransitAddress)
     *   .setSender(sender)
     *   .setRecipient(transit)
     *   .sign(secKey)
     */
    static DeleteTransitAddress: number;
    /**
     * @example
     * let trx = new Transaction()
     */
    constructor();
    /**
     * Статический метод, создает объект из массива байтов.
     * @param {ArrayLike<number>} bytes Транзакция в бинарном виде.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let bytes = new Uint8Array(150)
     * let trx = Transaction.fromBytes(bytes)
     */
    static fromBytes(bytes: ArrayLike<number>): Transaction;
    /**
     * Транзакция в бинарном виде, 150 байт.
     * @returns {number[]}
     * @example
     * let bytes = new Transaction().getBytes()
     */
    getBytes(): number[];
    /**
     * Хэш (txid) транзакции.
     * @returns {number[]}
     * @example
     * let hash = new Transaction().getHash()
     */
    getHash(): number[];
    /**
     * Версия (тип) транзакции.
     * @returns {number}
     * @example
     * let ver = new Transaction().getVersion()
     */
    getVersion(): number;
    /**
     * Устанавливает версию и возвращает this.
     * @param {number} version Версия (тип) транзакции.
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
    setVersion(version: number): Transaction;
    /**
     * Отправитель.\
     * Доступно для всех типов транзакций.
     * @returns {Address}
     * @example
     * let sender = new Transaction().getSender()
     */
    getSender(): Address;
    /**
     * Устанавливает отправителя и возвращает this.
     * @param {Address} address Адрес отправителя.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let sender = new Address()
     * let trx = new Transaction().setSender(sender)
     */
    setSender(address: Address): Transaction;
    /**
     * Получатель.\
     * Недоступно для транзакций CreateStructure и UpdateStructure.
     * @returns {Address}
     * @example
     * let recipient = new Transaction().getRecipient()
     */
    getRecipient(): Address;
    /**
     * Устанавливает получателя и возвращает this.\
     * Недоступно для транзакций CreateStructure и UpdateStructure.
     * @param {Address} address Адрес получателя.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let recipient = new Address()
     * let trx = new Transaction().setRecipient(recipient)
     */
    setRecipient(address: Address): Transaction;
    /**
     * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.\
     * Доступно только для Genesis и Basic транзакций.
     * @returns {number}
     * @example
     * let value = new Transaction().getValue()
     */
    getValue(): number;
    /**
     * Устанавливает сумму и возвращает this.\
     * Принимает значения в промежутке от 1 до 18446744073709551615.\
     * Доступно только для Genesis и Basic транзакций.
     * @param {number} value Целое число от 1 до 18446744073709551615.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setValue(42)
     */
    setValue(value: number): Transaction;
    /**
     * Nonce, целое число в промежутке от 0 до 18446744073709551615.\
     * Генерируется автоматически при вызове sign().
     * @returns {number}
     * @example
     * let nonce = new Transaction().getNonce()
     */
    getNonce(): number;
    /**
     * Устанавливает nonce и возвращает this.
     * @param {number} nonce Целое число в промежутке от 0 до 18446744073709551615.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let nonce = Date.now()
     * let trx = new Transaction().setNonce(nonce)
     */
    setNonce(nonce: number): Transaction;
    /**
     * Цифровая подпись транзакции, длина 64 байта.
     * @returns {number[]}
     * @example
     * let signature = new Transaction().getSignature()
     */
    getSignature(): number[];
    /**
     * Устанавливает цифровую подпись и возвращает this.
     * @param {ArrayLike<number>} signature Подпись, длина 64 байта.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let signature = new Uint8Array(64)
     * let trx = new Transaction().setSignature(signature)
     */
    setSignature(signature: ArrayLike<number>): Transaction;
    /**
     * Подписать транзакцию приватным ключом.
     * @param {SecretKey} secretKey Приватный ключ.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let secKey = SecretKey.fromSeed(new Uint8Array(32))
     * let trx = new Transaction().sign(secKey)
     */
    sign(secretKey: SecretKey): Transaction;
    /**
     * Префикс адресов, принадлежащих структуре.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {string}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * let prefix = trx.getPrefix()
     */
    getPrefix(): string;
    /**
     * Устанавливает префикс и возвращает this.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} prefix Префикс адресов, принадлежащих структуре.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(CreateStructure)
     * trx.setPrefix('aaa')
     */
    setPrefix(prefix: string): Transaction;
    /**
     * Название структуры в кодировке UTF-8.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {string}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * let name = trx.getName()
     */
    getName(): string;
    /**
     * Устанавливает название структуры и возвращает this.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {string} name Название структуры в кодировке UTF-8.
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * trx.setName('Hello World')
     */
    setName(name: string): Transaction;
    /**
     * Профита в сотых долях процента с шагом в 0.01%.\
     * Принимает значения от 100 до 500 (соответственно от 1% до 5%).\
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {number}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * let profit = trx.getProfitPercent(100)
     */
    getProfitPercent(): number;
    /**
     * Устанавливает процент профита и возвращает this.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Профит в сотых долях процента с шагом в 0.01%.
     * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * trx.setProfitPercent(100)
     */
    setProfitPercent(percent: number): Transaction;
    /**
     * Комиссия в сотых долях процента с шагом в 0.01%.\
     * Принимает значения от 0 до 2000 (соответственно от 0% до 20%).\
     * Доступно только для CreateStructure и UpdateStructure.
     * @returns {number}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * let fee = trx.getFeePercent()
     */
    getFeePercent(): number;
    /**
     * Устанавливает размер комиссии и возвращает this.\
     * Доступно только для CreateStructure и UpdateStructure.
     * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
     * @returns {Transaction}
     * @throws {Error}
     * @example
     * let trx = new Transaction().setVersion(Transaction.CreateStructure)
     * trx.setFeePercent(100)
     */
    setFeePercent(percent: number): Transaction;
    /**
     * Проверить транзакцию на соответствие формальным правилам.
     * @returns {boolean}
     * @throws {Error}
     * @example
     * let ver = new Transaction().verify()
     */
    verify(): boolean;
}
/**
 * Декодирует Base64 строку в массив байтов.
 * @param {string} base64 Строка в кодировке Base64.
 * @returns {number[]}
 * @throws {Error}
 */
export declare function base64Decode(base64: string): number[];
/**
 * Кодирует массив байтов в Base64 строку.
 * @param {number[]} bytes Массив байтов.
 * @returns {string}
 */
export declare function base64Encode(bytes: number[]): string;
/**
 * Декодирует Base16 строку в массив байтов.
 * @param {string} hex Строка в кодировке Base16.
 * @returns {number[]}
 * @throws {Error}
 */
export declare function hexDecode(hex: string): number[];
/**
 * Кодирует массив байтов в Base16 строку.
 * @param {number[]} bytes Массив байтов.
 * @returns {string}
 */
export declare function hexEncode(bytes: number[]): string;
/**
 * Декодирует массив байтов UTF-8 в строку в кодировке UTF-16.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
 * @param {number[]} bytes Массив байтов UTF-8.
 * @returns {string}
 */
export declare function textDecode(bytes: number[]): string;
/**
 * Кодирует UTF-16 строку в массив байтов UTF-8.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
 * @param {string} text Текстовая строка в кодировке UTF-16.
 * @returns {number[]}
 */
export declare function textEncode(text: string): number[];
