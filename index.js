const express = require('express');
const expressNunjucks = require('express-nunjucks');
const libIndex = require('./lib/index');
const libMiddleware = require('./lib/middleware');
const libExtension = require('./lib/extension');
const libAuth = require('./lib/auth');
const libRead = require('./lib/read');
const libCreate = require('./lib/create');
const libUpdate = require('./lib/update');
const log = require('debug')('r2:admin');

const toString = Object.prototype.toString;
module.exports = function AdminService(app, config) {
  const getConf = config || app.config('admin');
  if (!getConf) {
    return log('config not found!');
  }

  if (!getConf.enabled) {
    return log('ui is not enabled');
  }

  if (!app.hasServices('Nunjucks|User')) {
    return false;
  }

  // config vars
  const {
    routes = true,
    baseUrl = 'admin',
    login = 'login',
    logout = 'logout',
  } = getConf;

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

  const router = express.Router();

  // libraries
  libMiddleware(app, getConf, viewsPath, router);
  libExtension(app, njk);
  const auth = libAuth(app, getConf);
  const read = libRead(app, getConf);
  const create = libCreate(app, getConf);
  const update = libUpdate(app, getConf);

  // routes
  let initRoutes;
  const setRoutes = (routerInstance) => {
    routerInstance.get('/', libIndex(app));
    routerInstance.get(`/${login}`, auth.form);
    routerInstance.post(`/${login}`, auth.login);
    routerInstance.get(`/${logout}`, auth.logout);
    routerInstance.get('/:object', read.object);
    routerInstance.get('/:object/new', create.form);
    routerInstance.post('/:object/new', create.object);
    routerInstance.get('/:object/search', read.search);
    routerInstance.get('/:object/:id', update.form);
    routerInstance.post('/:object/:id', update.object);
  };

  if (routes) {
    setRoutes(router);
  } else {
    initRoutes = setRoutes;
  }

  app.use(`/${baseUrl}`, router);
  return { router, initRoutes, libExtension };
};
