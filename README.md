<h1 align="center">
  <a href="https://umi.top"><img src="./logo.svg" alt="UMI" width="200"></a>
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
- [Введение](#введение)
- [Установка](#установка)
  - [npm](#npm)
  - [yarn](#yarn)
  - [Отдельным файлом](#отдельным-файлом)
- [Подключение](#подключение)
  - [CommonJS](#commonjs)
  - [ES Modules](#es-modules)
  - [CDN](#cdn)
- [Примеры](#примеры)
  - [Мнемоники](#мнемоники)
    - [Seed из мнемонической фразы](#seed-из-мнемонической-фразы)
  - [Ключи](#ключи)
    - [Ключи из seed](#ключи-из-seed)
    - [Подписать сообщение](#подписать-сообщение)
    - [Проверить подпись](#проверить-подпись)
  - [Адреса](#адреса)
    - [Адрес в формате Bech32](#адрес-в-формате-bech32)
    - [Адрес из приватного или публичного ключа](#адрес-из-приватного-или-публичного-ключа)
    - [Префикс](#префикс)
  - [Транзакции](#транзакции)
    - [Перевести монеты](#перевести-монеты)
    - [Создать структуру](#создать-структуру)
    - [Обновить настройки структуры](#обновить-настройки-структуры)
    - [Установить адрес для начисления профита](#установить-адрес-для-начисления-профита)
    - [Установить адрес для перевода комиссии](#установить-адрес-для-перевода-комиссии)
    - [Активировать транзитный адрес](#активировать-транзитный-адрес)
    - [Деактивировать транзитный адрес](#деактивировать-транзитный-адрес)
    - [Отправить транзакцию в сеть](#отправить-транзакцию-в-сеть)
  - [Блоки](#блоки)
    - [Создать и подписать блок](#создать-и-подписать-блок)
    - [Распарсить блок](#распарсить-блок)
- [Лицензия](#лицензия)

## Введение

Библиотека написана на [TypeScript](https://www.typescriptlang.org) и
скомпилирована в модули CommonJS и ES Module по стандарту es6 и работает
во всех актуальных браузерах и Node.js начиная с версии 4.0.
Так же для совместимости с устаревшими браузерами скомпилирована iife версия
по стандарту es3, поддерживается Internet Explorer 6 и выше.

## Установка

Библиотека опубликована в репозитории [npm](https://www.npmjs.com) и может быть
установлена с помощью пакетного менеджера, например,
[npm](https://docs.npmjs.com) и [Yarn](https://yarnpkg.com):

### npm
```bash
npm install @umi-top/umi-core-js
```
### yarn
```bash
yarn add @umi-top/umi-core-js
```

### Отдельным файлом

Если требуется, библиотеку можно скачать в виде отдельного файла:  
CommonJS: [index.js](./lib/index.js),
ES Module: [index.mjs](./lib/index.mjs)
или IIFE [index.min.js](./lib/index.min.js).  
Так же можно скачать аннотации типов для
TypeScript: [index.d.ts](./lib/index.d.ts)
и Flow: [index.js.flow](./lib/index.js.flow).

## Подключение

### CommonJS

Если вы используете [Node.js](https://nodejs.org/api/modules.html):

```javascript
const umi = require('@umi-top/umi-core-js')
```

### ES Modules

Если вы используете [webpack](https://webpack.js.org/guides/getting-started/#modules),
[Rollup](https://rollupjs.org/guide/en/#importing),
[Parcel](https://parceljs.org/javascript.html) или [Node.js (>= v13)](https://nodejs.org/api/esm.html).

Для более эффективной работы алгоритма [tree shaking](https://webpack.js.org/guides/tree-shaking/)
рекомендуем импортировать только используемые значения:

```javascript
import { Address, PublicKey, SecretKey, Transaction } from '@umi-top/umi-core-js'
```

Импортировать все содержимое модуля можно используя следующий синтаксис:

```javascript
import * as umi from '@umi-top/umi-core-js'
```

Последний вариант будет использоваться в примерах ниже.

### CDN

Библиотеку можно использовать напрямую в браузере.

Если требуется максимальная совместимость, можно использовать
[IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) вариант:

```html
<script src="https://unpkg.com/@umi-top/umi-core-js"></script>
```

В [современных](https://caniuse.com/#feat=es6-module) браузерах можно
импортировать [модуль](https://v8.dev/features/modules):

```html
<script type="module">
import * as umi from 'https://unpkg.com/@umi-top/umi-core-js/lib/index.mjs'
</script>
```

## Примеры

### Мнемоники

UMI не накладывает никаких ограничений на способ генерации и хранения приватных
ключей, предоставляя полную свободу действий разработчикам приложений.

Для совместимости, рекомендуем использовать
[bip39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

#### Seed из мнемонической фразы

Для примера будем использовать библиотеку [bip39](https://www.npmjs.com/package/bip39):

```javascript
// npm install bip39

const bip39 = require('bip39')
const mnemonic = bip39.generateMnemonic(256)
const seed = bip39.mnemonicToSeedSync(mnemonic)
```

### Ключи

В UMI применяется [Ed25519](https://ed25519.cr.yp.to)
([RFC 8032](https://tools.ietf.org/html/rfc8032)) —
схема подписи [EdDSA](https://ru.wikipedia.org/wiki/EdDSA) использующая
[SHA-512](https://en.wikipedia.org/wiki/SHA-2)
и [Curve25519](https://en.wikipedia.org/wiki/Curve25519). 

#### Ключи из seed

Seed может быть любой длины. Оптимальным вариантом является длина 32 байта.

```javascript
const seed = new Uint8Array(32)
const secretKey = umi.SecretKey.fromSeed(seed)
const publicKey = secretKey.getPublicKey()
```

#### Подписать сообщение

В метод `SecretKey#sign()` необходимо передать массив байтов, поэтому если
требуется подписать текстовое сообщение его нужно преобразовать:

```javascript
const message = umi.textEncode('Hello World')
const signature = secretKey.sign(message)

console.log(umi.base64Encode(signature))
```

#### Проверить подпись

Метод `PublicKey#verifySignature()` принимает массив байтов, поэтому если
подпись передается в виде текста ее необходимо декодировать:

```javascript
const address = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
const message = umi.textEncode('Hello World')
const signature = umi.base64Decode('Jbi9YfwLcxiTMednl/wTvnSzsPP9mV9Bf2vvZytP87oyg1p1c9ZBkn4gNv15ZHwEFv3bVYlowgyIKmMwJLjJCw==')
const pubKey = umi.Address.fromBech32(address).getPublicKey()
const isValid = pubKey.verifySignature(signature, message)
```

### Адреса

UMI использует адреса в формате Bech32
([bip173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki))
длиной 62 символа и трёхбуквенный префикс.  
Специальным случаем являются Genesis-адреса, существующие только
в Genesis-блоке, такие адреса имеют длину 65 символов
и всегда имеют префикс `genesis`.

#### Адрес в формате Bech32

Создать адрес из строки Bech32 можно используя статический метод `Address.fromBech32()`
и экспортировать с помощью `Address#toBech32()`:

```javascript
const bech32 = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
const address = umi.Address.fromBech32(bech32)
console.log(address.getBech32())
```
 
#### Адрес из приватного или публичного ключа

Статический метод `Address.fromKey()` создает адрес из приватного
или публичного ключа:

```javascript
const seed = new Uint8Array(32)
const secKey = umi.SecretKey.fromSeed(seed)
const pubKey = secKey.getPublicKey()
const address1 = umi.Address.fromKey(secKey)
const address2 = umi.Address.fromKey(pubKey)
```

#### Префикс

По умолчанию адреса имеют префикс `umi`.
Изменить префикс можно при помощи метода `Address#setPrefix()`:

```javascript
const bech32 = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
const address = umi.Address.fromBech32(bech32).setPrefix('aaa')
console.log(address.getBech32())
```

### Транзакции

#### Перевести монеты

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const recipient = umi.Address.fromKey(secKey).setPrefix('aaa')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.Basic)
  .setSender(sender)
  .setRecipient(recipient)
  .setValue(42)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Создать структуру

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.CreateStructure)
  .setSender(sender)
  .setPrefix('aaa')
  .setName('🙂')
  .setProfitPercent(500)
  .setFeePercent(2000)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Обновить настройки структуры

Необходимо задать все поля, даже если они не изменились:

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.UpdateStructure)
  .setSender(sender)
  .setPrefix('aaa')
  .setName('🙂')
  .setProfitPercent(500)
  .setFeePercent(2000)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Установить адрес для начисления профита

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const newPrf = umi.Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.UpdateProfitAddress)
  .setSender(sender)
  .setRecipient(newPrf)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Установить адрес для перевода комиссии

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const newFee = umi.Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.UpdateFeeAddress)
  .setSender(sender)
  .setRecipient(newFee)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Активировать транзитный адрес

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const transit = umi.Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.CreateTransitAddress)
  .setSender(sender)
  .setRecipient(transit)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Деактивировать транзитный адрес

```javascript
const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
const sender = umi.Address.fromKey(secKey).setPrefix('umi')
const transit = umi.Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
const tx = new umi.Transaction()
  .setVersion(umi.Transaction.DeleteTransitAddress)
  .setSender(sender)
  .setRecipient(transit)
  .sign(secKey)

console.log(tx.verify())
console.log(umi.base64Encode(tx.getBytes()))
```

#### Отправить транзакцию в сеть

Пример для браузера с использованием
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
([Fetch polyfill](https://github.com/github/fetch)):

```javascript
const tx = new umi.Transaction()

fetch('https://testnet.umi.top/json-rpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: '',
    method: 'sendTransaction',
    params: {
      base64: umi.base64Encode(tx.getBytes())
    }
  })
}).then(function(response) {
  console.log(response.status)
  console.log(response.statusText)
  return response.json()
}).then(function(json) {
  console.log('parsed json', json)
}).catch(function(ex) {
  console.log('parsing failed', ex)
})
```

Пример для Node.js с использованием модуля [https](https://nodejs.org/api/https.html):

```javascript
const umi = require('@umi-top/umi-core-js')
const https = require('https')

const tx = new umi.Transaction()

const data = JSON.stringify({
  jsonrpc: '2.0',
  id: '',
  method: 'sendTransaction',
  params: {
    base64: Buffer.from(tx.getBytes()).toString('base64')
  }
})

const options = {
  hostname: 'testnet.umi.top',
  port: 443,
  path: '/json-rpc',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()
```

### Блоки

#### Создать и подписать блок

```javascript
...
```

#### Распарсить блок

```javascript
...
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
