const _ = require('underscore');

module.exports = (app, conf = {}) => {
  const { baseUrl = 'admin' } = conf;
  const form = 'admin/page/object/list.html';
  const getModel = object => app.service('Mongoose').model(object);

  return {
    object(req, res) {
      const { object } = req.params;
      const Model = getModel(object);
      res.render(form, {
        paths: Model.schema.paths,
        object,
      });
    },
  };
};
