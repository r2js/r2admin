const session = require('cookie-session');
const expressNunjucks = require('express-nunjucks');
const modelExtension = require('./extension/model');
const viewExtension = require('./extension/view');
const fieldExtension = require('./extension/field');

module.exports = (app, conf = {}, viewsPath) => {
  const {
    baseUrl = 'admin',
    name = 'admin',
    secret = 'admin',
    login = 'login',
    logout = 'logout',
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
  } = conf;

  app.use(session({ name, secret, maxAge }));

  console.log(app.get('view engine'), '------');
  const isDev = app.get('env') === 'development';
  const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev,
  });
  console.log(app.get('view engine'), '------');

  // set extensions
  modelExtension(app, njk);
  viewExtension(app, njk);
  fieldExtension(app, njk);

  app.all(`/${baseUrl}*`, (req, res, next) => {
    const segments = req.url.split('/');
    const segment = segments[2];
    const routes = [login, logout];

    if (!req.session.adminUser && !routes.includes(segment)) {
      return res.redirect(`/${baseUrl}/${login}`);
    }

    return next();
  });

  app.use((req, res, next) => {
    Object.assign(res.locals, {
      admin: { path: `${viewsPath}/admin`, conf, baseUrl, login, logout, now: Date.now() },
    });
    next();
  });

  const assignReq = (req, res, next) => {
    const { body = {}, params = {}, query = {} } = req;
    Object.assign(res.locals, {
      req: { body, params, query },
    });
    next();
  };

  return { njk, assignReq };
};
