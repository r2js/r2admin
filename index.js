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
const utils = require('./lib/utils');

const toString = Object.prototype.toString;
module.exports = function Admin(app, config) {
  const getConf = config || app.config('admin');
  if (!getConf) {
    return log('config not found!');
  }

  if (!getConf.enabled) {
    return log('ui is not enabled');
  }

  if (!app.hasServices('Nunjucks|User|I18N')) {
    return false;
  }

  // config vars
  const {
    routes = true,
    baseUrl = 'admin',
    login = 'login',
    logout = 'logout',
    preMiddleware = (req, res, next) => next(),
    authMiddleware = (req, res, next) => next(),
    routeMiddleware = (req, res, next) => next(),
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

  // inject pre middleware
  router.use(preMiddleware);

  const auth = libAuth(app, getConf);
  const read = libRead(app, getConf);
  const create = libCreate(app, getConf);
  const update = libUpdate(app, getConf);
  const Utils = utils(app);

  // routes
  let initRoutes;
  const setRoutes = (routerInstance) => {
    routerInstance.get('/', libIndex(app));
    routerInstance.get('/locale/:locale', Utils.locale);
    routerInstance.get(`/${login}`, authMiddleware, auth.form);
    routerInstance.post(`/${login}`, authMiddleware, auth.login);
    routerInstance.get(`/${logout}`, authMiddleware, auth.logout);
    routerInstance.get('/:object', routeMiddleware, read.object);
    routerInstance.get('/:object/new', routeMiddleware, create.form);
    routerInstance.post('/:object/new', routeMiddleware, create.object);
    routerInstance.get('/:object/search', routeMiddleware, read.search);
    routerInstance.get('/:object/:id', routeMiddleware, update.form);
    routerInstance.post('/:object/:id', routeMiddleware, update.object);
  };

  if (routes) {
    setRoutes(router);
  } else {
    initRoutes = setRoutes;
  }

  app.use(`/${baseUrl}`, router);
  return { router, initRoutes, libExtension, utils: Utils, njk };
};
