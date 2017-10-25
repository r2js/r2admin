const session = require('cookie-session');
const flash = require('connect-flash');

module.exports = (app, conf = {}, viewsPath, router) => {
  const env = app.get('env');

  const {
    baseUrl = 'admin',
    name = 'admin',
    secret = 'admin',
    login = 'login',
    logout = 'logout',
    maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
    setSession = true,
    setFlash = true,
  } = conf;

  if (setSession) {
    router.use(session({ name, secret, maxAge }));
  }

  if (setFlash) {
    router.use(flash());
  }

  router.all('/*', (req, res, next) => {
    const segments = req.url.split('/');
    const segment = segments[1];
    const routes = [login, logout];

    if (!req.session.adminUser && !routes.includes(segment)) {
      return res.redirect(`/${baseUrl}/${login}`);
    }

    return next();
  });

  router.use((req, res, next) => {
    const { path } = req;
    const version = env === 'development' ? Date.now() : res.locals.gitversion;

    Object.assign(res.locals, {
      urlPath: path,
      session: req.session,
      admin: {
        path: `${viewsPath}/admin`,
        now: Date.now(),
        rand: app.utils.random,
        conf,
        baseUrl,
        login,
        logout,
        version,
      },
    });

    next();
  });
};
