<h1 align="center">
  <a href="https://umi.top"><img src="../logo.svg" alt="UMI" width="200"></a>
  <br>
  UMI Core - JavaScript Library
  <br>
  <br>
</h1>

<p align="center">
  <!-- release    --><a href="https://github.com/umi-top/umi-core-js"><img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/umi-top/umi-core-js?sort=semver"></a>
  <!-- build      --><a href="https://travis-ci.org/umi-top/umi-core-js"><img alt="travis" src="https://img.shields.io/travis/umi-top/umi-core-js/master"></a>
  <!-- coverage   --><img alt="Coveralls github branch" src="https://img.shields.io/coveralls/github/umi-top/umi-core-js/master">
  <!-- types      --><img alt="npm type definitions" src="https://img.shields.io/npm/types/@umi-top/umi-core-js">
  <!-- code style --><a href="https://standardjs.com"><img alt="Standard" src="https://img.shields.io/badge/code_style-standard-green"></a>
  <!-- license    --><a href="https://github.com/umi-top/umi-core-js/blob/master/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/umi-top/umi-core-js"></a>
  <!-- PGP        --><a href="https://keybase.io/umitop"><img alt="Keybase PGP" src="https://img.shields.io/keybase/pgp/umitop"></a>
  <br/>
  <!-- npm ver    --><a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img alt="npm version" src="https://img.shields.io/npm/v/@umi-top/umi-core-js"></a>
  <!-- node       --><a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img alt="node-current (scoped)" src="https://img.shields.io/node/v/@umi-top/umi-core-js"></a>
  <!-- downloads  --><a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@umi-top/umi-core-js"></a>
</p>

## Оглавление
-   Введение

-   [Установка](#установка)
    - npm
    - yarn

-   [Подключение](#подключение)
    - CommonJS
    - ES Modules
    - CDN

-   [Примеры](#примеры)
    -   [Ключи](#ключи)

        - Приватный ключ из seed
        - Приватный ключ из мнемонической фразы
        - Создание и проверка цифровой подписи

    -   [Адреса](#адреса)
        - Адреса в формате Bech32
        - Адрес из приватного или публичного ключа
        - Установка и смена префикса адреса

    -   [Транзакции](#транзакции)
        - Отправка монет
        - Создание структуры
        - Обновление настроек структуры
        - Установка адреса для начисления профита
        - Установка адреса для перевода комиссии
        - Активация транзитного адреса
        - Деактивация транзитного адреса

    -   [Блоки](#блоки)
        - Создание и подпись блоков
        - Парсинг блоков

-   [Лицензия](#лицензия)

## Введение

## Установка

### npm
```bash
npm install @umi-top/umi-core-js
```
### yarn
```bash
yarn add @umi-top/umi-core-js
```

## Подключение

### CommonJS
Node

### ES Modules
Webpack, Rollup, Parcel, Node

### CDN
Browser

Import as CommonJS:
```javascript
const umi = require('@umi-top/umi-core-js')
const bip39 = require('bip39')
```
Import as ES6 / ES2015 Module
```javascript
import * as umi from '@umi-top/umi-core-js'
import * as bip39 from 'bip39'
```

Import as UMD in Browser
```html
<script src="bip39.browser.js"></script>
<script src="lib/index.min.js"></script>
```

## Примеры

### Ключи

### Addresses
Create Address from Mnemonic
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)
const pubKey = secKey.publicKey
const address = new umi.Address().setPublicKey(pubKey)

console.log(address.bech32) // umi1u3dam33jaf64z4s008g7su62j4za72ljqff9dthsataq8k806nfsgrhdhg

```
Change Address Prefix
```javascript
const bech32 = 'umi1kzsn227tel8aj5p5upaecz7e72k3k8w0lel3lffrnvg3d5rkh5uq3a8598'

const address = new umi.Address()
address.bech32 = bech32
address.prefix = 'sss'

console.log(address.bech32) // sss1kzsn227tel8aj5p5upaecz7e72k3k8w0lel3lffrnvg3d5rkh5uqv9z0az
```

### Transactions
Basic Transaction
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const bech32 = 'xxx1hztcwh6rh63ftkw8y8cwt63n4256u3packsxh05wv5x5cpa79raqyf98d5'

const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)
const sender = new umi.Address().setPublicKey(secKey.publicKey)
const recpient = new umi.Address().fromBech32(bech32).setPrefix('yyy')
const tx1 = new umi.Transaction()
  .setVersion(umi.TransactionVersions.Basic)
  .setSender(sender)
  .setRecipient(recpient)
  .setValue(9007199254740991)
  .sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'recipient': tx2.recipient.bech32,
  'value': tx2.value,
  'signature': Buffer.from(tx2.signature).toString('hex'),
  'verify': tx2.verify()
})
```
Create Structure
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)

const tx1 = new umi.Transaction().
  setVersion(umi.TransactionVersions.CreateStructure).
  setSender(new umi.Address().setPublicKey(secKey.publicKey)).
  setPrefix('www').
  setName('World Wide Web').
  setProfitPercent(456). // 4.56%
  setFeePercent(1234).  // 12.34%
  sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'prefix': tx2.prefix,
  'name': tx2.name,
  'profit': tx2.profitPercent / 100,
  'fee': tx2.feePercent / 100,
  'verify': tx2.verify(),
})
```
Create Transit Address
```javascript

const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)

const sender = new umi.Address()
sender.publicKey = secKey.publicKey

const address = new umi.Address()
address.bech32 = 'www1hztcwh6rh63ftkw8y8cwt63n4256u3packsxh05wv5x5cpa79raq9g5cvs'

const tx1 = new umi.Transaction()
tx1.version = umi.TransactionVersions.CreateTransitAddress
tx1.sender = sender
tx1.recipient = address
tx1.sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'prefix': tx2.prefix,
  'address': tx2.recipient.bech32,
  'verify': tx2.verify(),
})
```

## Лицензия

```text
Лицензия MIT

Copyright © 2020 UMI

Данная лицензия разрешает лицам, получившим копию данного программного
обеспечения и сопутствующей документации (в дальнейшем именуемыми
«Программное обеспечение»), безвозмездно использовать Программное обеспечение
без ограничений, включая неограниченное право на использование, копирование,
изменение, слияние, публикацию, распространение, сублицензирование и/или
продажу копий Программного обеспечения, а также лицам, которым предоставляется
данное Программное обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть
включены во все копии или значимые части данного Программного обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО
ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ
ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ,
НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ
ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ
ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА
ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ
ОБЕСПЕЧЕНИЕМ. 
```
