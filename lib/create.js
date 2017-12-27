const _ = require('underscore');
const adminUtils = require('./utils');

module.exports = (app, conf = {}) => {
  const AdminUtils = adminUtils(app);
  const { baseUrl = 'admin' } = conf;
  const { errors } = AdminUtils;
  const { created } = app.handler;
  const { partial: p } = _;

  return {
    form(req, res) {
      const { object } = req.params;
      res.render(`admin/object/${object}/form.html`, { object });
    },

    object(req, res, next) {
      const { object } = req.params;
      const body = _.omit(req.body, _.isEmpty);
      Object.assign(body, {
        actor: req.session.adminUser.userId,
        i18n: req.body.i18n || 'en',
      });

      let responseData;
      AdminUtils.getModel(object).create(body)
        .then((modelData) => {
          responseData = modelData;
          return modelData.applyPatch ? modelData.applyPatch() : Promise.resolve();
        })
        .then(() => {
          if (req.xhr) {
            return created(responseData, res);
          }

          req.flash('info', { type: 'objectCreated' });

          let redirect = `/${baseUrl}/${object}`;
          if (req.query.redirect) {
            redirect = req.query.redirect;
          } else if (req.body.redirect) {
            redirect = req.body.redirect;
          }

          return res.redirect(redirect);
        })
        .catch((err) => {
          if (req.xhr) {
            return p(errors, next)(err);
          }

          return res.render(`admin/object/${object}/form.html`, {
            errors: err.errors,
            data: req.body,
            object,
          });
        });
    },
  };
};
