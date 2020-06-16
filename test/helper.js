const crypto = require('crypto')
const assert = require('chai').assert
const umi = require('../dist')

global.assert = assert
global.umi = umi
global.crypto = crypto
