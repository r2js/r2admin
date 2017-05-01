const nunjucks = require('nunjucks');
const parse = require('./parser');

module.exports = (app, njk) => {
  function FieldExtension() {
    this.tags = ['field'];
    this.parse = parse('field', this);
    this.run = (context, options = {}, body, errorBody, cb) => {
      const model = context.ctx.object || options.model;
      const { name } = options;
      const field = app.service('Mongoose').model(model).schema.paths[name];
      const type = field.instance.toLowerCase();
      app.render(
        `admin/tag/field/${type}.html`,
        Object.assign({ name }, options),
      (err, html) => {
        cb(null, new nunjucks.runtime.SafeString(html));
      });
    };
  }

  njk.env.addExtension('FieldExtension', new FieldExtension());
};
