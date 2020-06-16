<h1 align="center">
  <a href="https://umi.top"><img src="file:/Users/axel/umi/umi-core-js/logo.svg" alt="UMI" width="200"></a>
  <br>
  UMI Core - JavaScript Library
  <br>
  <br>
</h1>

<p align="center">
  <img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/umi-top/umi-core-js.svg">
  <!--a href="https://travis-ci.org/umi-top/umi-core-js"><img src="https://img.shields.io/travis/umi-top/umi-core-js/master.svg" alt="travis"></a-->
  <img alt="npm type definitions" src="https://img.shields.io/npm/types/@umi-top/umi-core-js">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  <a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img src="https://img.shields.io/npm/l/@umi-top/umi-core-js.svg" alt="npm license"></a>
  <a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img src="https://img.shields.io/npm/v/@umi-top/umi-core-js.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img src="https://img.shields.io/npm/dm/@umi-top/umi-core-js.svg" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/@umi-top/umi-core-js"><img src="https://img.shields.io/librariesio/release/npm/@umi-top/umi-core-js.svg" alt="Libraries.io dependency status for latest release, scoped npm package"></a>
  <a href="https://keybase.io/umitop"><img alt="Keybase PGP" src="https://img.shields.io/keybase/pgp/umitop.svg"></a>
</p>


## Table of Contents
- Quick start
  - [Install](#install)
  - [Usage](#usage)
  - [What you might do if you're clever](#what-you-might-do-if-youre-clever)
- FAQ
  - [Why should I use JavaScript Standard Style?](#why-should-i-use-javascript-standard-style)
  - [Who uses JavaScript Standard Style?](#who-uses-javascript-standard-style)
  - [Are there text editor plugins?](#are-there-text-editor-plugins)
  - [Is there a readme badge?](#is-there-a-readme-badge)
  - [I disagree with rule X, can you change it?](#i-disagree-with-rule-x-can-you-change-it)
  - [But this isn't a real web standard!](#but-this-isnt-a-real-web-standard)
  - [Is there an automatic formatter?](#is-there-an-automatic-formatter)
  - [How do I ignore files?](#how-do-i-ignore-files)
  - [How do I hide a certain warning?](#how-do-i-hide-a-certain-warning)
  - [I use a library that pollutes the global namespace. How do I prevent "variable is not defined" errors?](#i-use-a-library-that-pollutes-the-global-namespace-how-do-i-prevent-variable-is-not-defined-errors)
  - [How do I use experimental JavaScript (ES Next) features?](#how-do-i-use-experimental-javascript-es-next-features)
  - [Can I use a JavaScript language variant, like Flow or TypeScript?](#can-i-use-a-javascript-language-variant-like-flow-or-typescript)
  - [What about Mocha, Jest, Jasmine, QUnit, etc?](#what-about-mocha-jest-jasmine-qunit-etc)
  - [What about Web Workers and Service Workers?](#what-about-web-workers-and-service-workers)
  - [Can I check code inside of Markdown or HTML files?](#can-i-check-code-inside-of-markdown-or-html-files)
  - [Is there a Git `pre-commit` hook?](#is-there-a-git-pre-commit-hook)
  - [How do I make the output all colorful and pretty?](#how-do-i-make-the-output-all-colorful-and-pretty)
  - [Is there a Node.js API?](#is-there-a-nodejs-api)
  - [How do I contribute to StandardJS?](#how-do-i-contribute-to-standardjs)
- [License](#license)

### Install

    npm i @umi-top/umi-core-js

### Import
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