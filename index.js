const express = require('express');
const path = require('path');
const libIndex = require('./lib/index');
const libAuth = require('./lib/auth');
const libMiddleware = require('./lib/middleware');
const libCreate = require('./lib/create');
const libObject = require('./lib/object');
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
  const { assignReq } = middleware;
  const auth = libAuth(app, conf);
  const create = libCreate(app, conf);
  const object = libObject(app, conf);

  app.get(`/${baseUrl}`, assignReq, libIndex(app));
  app.get(`/${baseUrl}/${login}`, assignReq, auth.form);
  app.post(`/${baseUrl}/${login}`, assignReq, auth.login);
  app.get(`/${baseUrl}/${logout}`, assignReq, auth.logout);
  app.get(`/${baseUrl}/:object/new`, assignReq, create.form);
  app.post(`/${baseUrl}/:object/new`, assignReq, create.object);
  app.get(`/${baseUrl}/:object/search`, assignReq, object.search);
  app.get(`/${baseUrl}/:object/ids`, assignReq, object.ids);

  return middleware;
};
