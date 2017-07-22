const express = require('express');
const expressNunjucks = require('express-nunjucks');
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

  if (getConfig.disabled) {
    return log('admin ui is disabled');
  }

  if (!app.hasServices('Nunjucks|Query|User|Upload')) {
    return false;
  }

  // config vars
  const { baseUrl = 'admin', login = 'login', logout = 'logout' } = conf;

  // set views directory
  const viewsPath = `${__dirname}/views`;
  let views = app.get('views');
  views = toString.call(views) === '[object String]' ? [views] : views;
  views = views.concat([viewsPath]);
  app.set('views', views);

  // reinit nunjucks with multiple views directories
  const isDev = app.get('env') === 'development';
  const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev,
  });

  // admin assets
  app.use(express.static(`${__dirname}/public`, { maxAge: '1d' }));

  // libraries
  libMiddleware(app, getConfig, viewsPath, njk);
  const auth = libAuth(app, getConfig);
  const create = libCreate(app, getConfig);
  const read = libRead(app, getConfig);
  const object = libObject(app, getConfig);
  const file = libFile(app, getConfig);

  // routes
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
};
