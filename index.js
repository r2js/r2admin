const express = require('express');
const path = require('path');
const libIndex = require('./lib/index');
const libAuth = require('./lib/auth');
const libMiddleware = require('./lib/middleware');
const libCreate = require('./lib/create');
const log = require('debug')('r2:admin');

const toString = Object.prototype.toString;
module.exports = function Admin(app, conf) {
  const getConfig = conf || app.config('admin');
  if (!getConfig) {
    return log('admin config not found!');
  }

  const User = app.service('User');
  if (!User) {
    return log('service [User] not found!');
  }

  const viewsPath = `${__dirname}/views`;
  app.use((req, res, next) => {
    Object.assign(res.locals, {
      adminPath: `${viewsPath}/admin`,
      adminConf: conf,
    });
    next();
  });

  let views = app.get('views');
  views = toString.call(views) === '[object String]' ? [views] : views;
  views = views.concat([viewsPath]);
  app.set('views', views);

  const staticDir = path.dirname(process.cwd());
  app.use(express.static(`${staticDir}/public`, {}));

  const middleware = libMiddleware(app, conf);
  const auth = libAuth(app, conf);
  const create = libCreate(app, conf);
  const { baseUrl = 'admin', login = 'login', logout = 'logout' } = conf;

  app.get(`/${baseUrl}`, libIndex(app));
  app.get(`/${baseUrl}/${login}`, auth.form);
  app.post(`/${baseUrl}/${login}`, auth.login);
  app.get(`/${baseUrl}/${logout}`, auth.logout);
  app.get(`/${baseUrl}/test`, auth.test);
  app.get(`/${baseUrl}/o/:object/new`, create.form);
  app.post(`/${baseUrl}/o/:object/save`, create.object);

  return middleware;
};
