const express = require('express');
const path = require('path');
const libIndex = require('./lib/index');
const libAuth = require('./lib/auth');
const libMiddleware = require('./lib/middleware');
const libCreate = require('./lib/create');
const libRead = require('./lib/read');
const libObject = require('./lib/object');
const libFile = require('./lib/file');
const log = require('debug')('r2:admin');

const toString = Object.prototype.toString;
module.exports = function Admin(app, conf) {
  const getConfig = conf || app.config('admin');
  if (!getConfig) {
    return log('admin config not found!');
  }

  if (!app.hasServices('Query|User|Upload')) {
    return false;
  }

  process.env.TZ = 'UTC';
  const { baseUrl = 'admin', login = 'login', logout = 'logout' } = conf;
  const viewsPath = `${__dirname}/views`;

  // set views directory
  let views = app.get('views');
  views = toString.call(views) === '[object String]' ? [views] : views;
  views = views.concat([viewsPath]);
  app.set('views', views);

  // static middleware
  const staticDir = path.dirname(process.cwd());
  app.use(express.static(`${staticDir}/public`, { maxAge: '1d' }));

  // libraries
  const middleware = libMiddleware(app, conf, viewsPath);
  const auth = libAuth(app, conf);
  const create = libCreate(app, conf);
  const read = libRead(app, conf);
  const object = libObject(app, conf);
  const file = libFile(app, conf);

  app.get(`/${baseUrl}`, libIndex(app));
  app.get(`/${baseUrl}/${login}`, auth.form);
  app.post(`/${baseUrl}/${login}`, auth.login);
  app.get(`/${baseUrl}/${logout}`, auth.logout);
  app.post(`/${baseUrl}/upload`, file.upload);
  app.get(`/${baseUrl}/:object/new`, create.form);
  app.post(`/${baseUrl}/:object/new`, create.object);
  app.get(`/${baseUrl}/:object/search`, object.search);
  app.get(`/${baseUrl}/:object/ids`, object.ids);
  app.get(`/${baseUrl}/:object/query`, object.apiQuery);
  app.get(`/${baseUrl}/:object`, read.object);

  return middleware;
};
