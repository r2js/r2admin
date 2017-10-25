module.exports = (app, conf = {}) => {
  const { baseUrl = 'admin' } = conf;
  const User = app.service('User');
  const form = 'admin/page/auth/login.html';

  return {
    form(req, res) {
      if (req.session.adminUser) {
        return res.redirect(`/${baseUrl}`);
      }

      return res.render(form, {});
    },

    login(req, res) {
      User.login(req.body)
        .then((data) => {
          req.session.adminUser = data;
          res.redirect(`/${baseUrl}`);
        })
        .catch((errors) => {
          res.render(form, { errors });
        });
    },

    logout(req, res) {
      req.session = null;
      res.redirect(`/${baseUrl}`);
    },
  };
};
