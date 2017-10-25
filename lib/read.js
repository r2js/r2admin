const _ = require('underscore');
const adminUtils = require('./utils');

module.exports = (app) => {
  const AdminUtils = adminUtils(app);
  const { errors } = AdminUtils;
  const { ok } = app.handler;
  const { partial: p } = _;

  const checkGetData = (data, res) => {
    if (!data) {
      return Promise.reject({ name: 'notFound' });
    }
    return ok(data, res);
  };

  return {
    object(req, res) {
      const { object } = req.params;
      const Model = AdminUtils.getModel(object);
      const querymen = AdminUtils.parseQuery(Model, req.query);
      res.render(`admin/object/${object}/list.html`, { object, querymen });
    },

    search(req, res, next) {
      const { object } = req.params;
      const Model = AdminUtils.getModel(object);

      const {
        query, select, cursor: { sort, limit, skip, populate },
      } = AdminUtils.parseQuery(Model, req.query);

      return Model.apiQuery(query, { sort, limit, skip, populate, fields: select })
        .then(data => checkGetData(data, res))
        .catch(p(errors, next));
    },
  };
};
