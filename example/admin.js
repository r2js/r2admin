const express = require('express');
const r2base = require('r2base');
const r2middleware = require('r2middleware');
const r2mongoose = require('r2mongoose');
const r2acl = require('r2acl');
const r2system = require('r2system');
const r2user = require('r2user');
const r2query = require('r2query');
const r2plugin = require('r2plugin');
const r2nunjucks = require('r2nunjucks');
const r2i18n = require('r2i18n');
const r2admin = require('../index');

process.chdir(__dirname);
const app = r2base();

app.start()
  .serve(r2middleware)
  .serve(r2mongoose)
  .serve(r2acl)
  .serve(r2system)
  .serve(r2query)
  .serve(r2plugin)
  .serve(r2i18n)
  .load('model')
  .serve(r2user)
  .use(express.static(`${__dirname}/public`, { maxAge: '1d' }))
  .serve(r2nunjucks)
  .serve(r2admin)
  .listen();

const { Users } = app.service('System');
Users.create({ email: 'admin@test.com', passwd: '1234', isEnabled: true, isVerified: true })
  .then(() => Users.create({ email: 'user1@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user2@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user3@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user4@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user5@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .catch();
