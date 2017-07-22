const _ = require('underscore');

module.exports = (app, conf = {}) => {
  const { baseUrl = 'admin' } = conf;
  const form = 'admin/page/object/new.html';
  const getModel = object => app.service('Mongoose').model(object);

  return {
    form(req, res) {
      const { object } = req.params;
      const Model = getModel(object);
      res.render(form, {
        paths: Model.schema.paths,
        object,
      });
    },

    object(req, res) {
      const { object } = req.params;
      const Model = getModel(object);
      const body = _.omit(req.body, _.isEmpty);
      Object.assign(body, { i18n: 'en' });
      const model = new Model(body);
      model.save()
        .then(() => {
          // TODO: flash message
          res.redirect(`/${baseUrl}/${object}`);
        })
        .catch((err) => {
          res.render(form, {
            paths: Model.schema.paths,
            errors: err.errors,
            data: req.body,
            object,
          });
        });
    },
  };
};
