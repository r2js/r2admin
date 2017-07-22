const express = require('express');
const r2base = require('r2base');
const r2middleware = require('r2middleware');
const r2mongoose = require('r2mongoose');
const r2acl = require('r2acl');
const r2system = require('r2system');
const r2user = require('r2user');
const r2query = require('r2query');
const r2upload = require('r2upload');
const r2nunjucks = require('r2nunjucks');
const r2admin = require('../index');

process.chdir(__dirname);
const app = r2base();

app.start()
  .serve(r2middleware)
  .serve(r2mongoose, { database: 'r2admin', debug: true })
  .serve(r2acl)
  .serve(r2system)
  .serve(r2query)
  .load('model')
  .serve(r2user, { jwt: { secret: '1234', expiresIn: 7 } })
  .serve(r2upload, {
    dir: 'public/upload',
    base: 'public',
  })
  .use(express.static(`${__dirname}/public`, { maxAge: '1d' }))
  .serve(r2nunjucks)
  .serve(r2admin, {
    // disabled: false,
    models: {
      test: {
        nav: 'My Test Model',
      },
      test2: {
        nav: 'My Test Model 2',
      },
    },
  })
  .listen();

const { Users } = app.service('System');
Users.create({ email: 'admin@test.com', passwd: '1234', isEnabled: true, isVerified: true })
  .then(() => Users.create({ email: 'user1@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user2@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user3@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user4@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .then(() => Users.create({ email: 'user5@test.com', passwd: '1234', isEnabled: true, isVerified: true }))
  .catch();
