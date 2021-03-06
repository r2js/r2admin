module.exports = (app) => {
  const { models, baseUrl = 'admin' } = app.config('admin');
  const { cookie = 'locale' } = app.config('i18n');
  const { unprocessableEntity, notFound, internalServerError } = app.handler;
  const getModel = object => app.service('Mongoose').model(object);

  return {
    getModel(object) {
      return getModel(this.getModelName(object));
    },

    getModelName(object) {
      let modelName = object;
      if (models[object] && models[object].model) {
        modelName = models[object].model;
      }

      return modelName;
    },

    parseQuery(model, query) {
      const { r2options = {} } = model.schema;
      const { adminSearch } = r2options;

      if (!adminSearch) {
        return query;
      }

      const search = adminSearch();
      return search.parse(query);
    },

    locale(req, res) {
      res.cookie(cookie, req.params.locale, { maxAge: 900000, httpOnly: true });
      res.redirect(`/${baseUrl}`);
    },

    errors(next, err) {
      // console.log(err);
      const { name, message, errors } = err;
      const errObj = { name, errors };
      const nameToLower = name.toLowerCase();

      if (nameToLower === 'validationerror') {
        return next(unprocessableEntity(errObj));
      } else if (nameToLower === 'notfound') {
        return next(notFound(message));
      }

      return next(internalServerError(errObj));
    },
  };
};
