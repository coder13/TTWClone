var assert = require('assert');
var colors = require('colors');
var configuration = require('./configuration');

// Test configuration.isPort()

// Good Cases
assert.ok(configuration.isPort(0));
assert.ok(configuration.isPort(80));
assert.ok(configuration.isPort(65535));

// Bad Cases
assert.ok(!configuration.isPort(-1));
assert.ok(!configuration.isPort(65536));
assert.ok(!configuration.isPort(-Number.MAX_VALUE));
assert.ok(!configuration.isPort(Number.MAX_VALUE));
assert.ok(!configuration.isPort(1.5));
assert.ok(!configuration.isPort(NaN));
assert.ok(!configuration.isPort('test'));

console.log('configuration.isPort() passed!'.green);

// Test configuration.isHost()

// Good Cases
assert.ok(configuration.isHost('0.0.0.0'));
assert.ok(configuration.isHost('255.255.255.255'));
assert.ok(configuration.isHost('1.2.3.4'));
assert.ok(configuration.isHost('192.168.0.1'));
assert.ok(configuration.isHost('192.168.0.255'));
assert.ok(configuration.isHost('0000:0000:0000:0000:0000:0000:0000:0000'));
assert.ok(configuration.isHost('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'));
assert.ok(configuration.isHost('FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF'));
assert.ok(configuration.isHost('1:2:3:4:5:6:7:8'));
assert.ok(configuration.isHost('1::2:3:4:5:6:7'));
assert.ok(configuration.isHost('1:2::3:4:5:6:7'));
assert.ok(configuration.isHost('1:2:3::4:5:6:7'));
assert.ok(configuration.isHost('1:2:3:4::5:6:7'));
assert.ok(configuration.isHost('1:2:3:4:5::6:7'));
assert.ok(configuration.isHost('1:2:3:4:5:6::7'));
assert.ok(configuration.isHost('::'));
assert.ok(configuration.isHost('fd00:0000:0000:0000:0000:0000:0000:0000'));
assert.ok(configuration.isHost('fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'));
assert.ok(configuration.isHost('www.test.test'));
assert.ok(configuration.isHost('test.test'));

// Bad Cases
assert.ok(!configuration.isHost('0.0.0'));
assert.ok(!configuration.isHost('0.0.0.'));
assert.ok(!configuration.isHost('.0.0.0'));
assert.ok(!configuration.isHost('0..0.0'));
assert.ok(!configuration.isHost('0.0..0'));
assert.ok(!configuration.isHost('256.256.256.256'));
assert.ok(!configuration.isHost('10000:0000:0000:0000:0000:0000:0000:0000'));
assert.ok(!configuration.isHost('0000:10000:0000:0000:0000:0000:0000:0000'));
assert.ok(!configuration.isHost('0000:0000:10000:0000:0000:0000:0000:0000'));
assert.ok(!configuration.isHost('0000:0000:0000:10000:0000:0000:0000:0000'));
assert.ok(!configuration.isHost('0000:0000:0000:0000:10000:0000:0000:0000'));
assert.ok(!configuration.isHost('0000:0000:0000:0000:0000:10000:0000:0000'));
assert.ok(!configuration.isHost('0000:0000:0000:0000:0000:0000:10000:0000'));
assert.ok(!configuration.isHost('0000:0000:0000:0000:0000:0000:0000:10000'));
assert.ok(!configuration.isHost('1:2:3:4:5:6:7:8:9'));
assert.ok(!configuration.isHost('1::2::3::4:5'));
assert.ok(!configuration.isHost('test'));
assert.ok(!configuration.isHost('http://test.test'));
assert.ok(!configuration.isHost('http://www.test.test'));
assert.ok(!configuration.isHost('https://test.test'));
assert.ok(!configuration.isHost('https://www.test.test'));
assert.ok(!configuration.isHost('http://test.test/'));
assert.ok(!configuration.isHost('http://www.test.test/'));
assert.ok(!configuration.isHost('https://test.test/'));
assert.ok(!configuration.isHost('https://www.test.test/'));
assert.ok(!configuration.isHost('http://test.test/test'));
assert.ok(!configuration.isHost('http://www.test.test/test'));
assert.ok(!configuration.isHost('https://test.test/test'));
assert.ok(!configuration.isHost('https://www.test.test/test'));
assert.ok(!configuration.isHost(5));

console.log('configuration.isHost() passed!'.green);