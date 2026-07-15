const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('server mounts every business module', () => {
  const server = read('server.js');
  for (const route of ['/api/auth', '/api/products', '/api/cart', '/api/orders', '/api/admin']) {
    assert.match(server, new RegExp(route.replaceAll('/', '\\/')));
  }
});

test('Express application can be composed without opening a database connection', () => {
  const { app, start } = require('../src/server');
  assert.equal(typeof app, 'function');
  assert.equal(typeof start, 'function');
});

test('controllers only depend on services or middleware-level types', () => {
  const controllers = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.name.endsWith('.controller.js')) controllers.push(target);
    }
  };
  visit(path.join(root, 'modules'));
  for (const controller of controllers) {
    const content = fs.readFileSync(controller, 'utf8');
    assert.doesNotMatch(content, /repositories\//, `${controller} must not import repositories`);
    assert.doesNotMatch(content, /\.model/, `${controller} must not import models`);
  }
});

test('JSON repository was removed after PostgreSQL migration', () => {
  assert.equal(fs.existsSync(path.join(root, 'repositories', 'jsonRepository.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'data', 'db.json')), false);
});
