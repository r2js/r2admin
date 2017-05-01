module.exports = (app, conf = {}) => {
  const { baseUrl = 'admin', models } = conf;
  const form = 'admin/page/object/new.html';

  return {
    form(req, res) {
      const { object } = req.params;
      const Model = app.service('Mongoose').model(object);
      res.render(form, {
        paths: Model.schema.paths,
        object,
      });
    },

    object(req, res) {
      const { object } = req.params;
      const Model = app.service('Mongoose').model(object);
      const model = new Model(req.body);
      model.save()
        .then((data) => {
          console.log(data);
          res.render(form, {
            paths: Model.schema.paths,
            object,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render(form, {
            paths: Model.schema.paths,
            object,
          });
        });
    },
  };
};
