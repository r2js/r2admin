const nunjucks = require('nunjucks');
const dot = require('dotty');
const parse = require('./parser');
const log = require('debug')('r2:admin:extension:field');

module.exports = (app, njk) => {
  function FieldExtension() {
    this.tags = ['field'];
    this.parse = parse('field', this);

    this.run = (context, options = {}, body, errorBody, cb) => {
      const { model: optModel, name, parent = '' } = options;
      const { object, errors = {}, data = {}, locale } = context.ctx;

      const model = optModel || object;
      const Model = app.service('Mongoose').model(model);
      const schema = Model.schema;
      const obj = Model.schema.obj[parent || name];
      let path = Model.schema.paths[parent || name];
      if (parent) {
        path = path.schema.paths[name];
      }

      const pathOpts = dot.get(path, 'caster.options') || path.options;
      let type = pathOpts.field || path.instance.toLowerCase();
      const ref = dot.get(path, 'caster.options.ref') || path.options.ref || obj.ref;

      if (type === 'array' && path.schema) {
        type = 'embeddedArray';
      } else if (ref) {
        type = 'relation';
      }

      // set field placeholder
      let lang = locale;
      if (context.ctx.req.query.lang) {
        lang = context.ctx.req.query.lang;
      }

      const attrName = dot.get(schema, `r2options.attributes.${lang}.${name}`);
      if (lang && attrName && !options.placeholder) {
        Object.assign(options, { placeholder: attrName });
      }

      app.render(
        `tag/field/${type}.html`,
        Object.assign({ name, errors, data, type, path, pathOpts, model, parent }, options),
        (err, html) => {
          if (err) {
            log(err);
          }

          cb(null, new nunjucks.runtime.SafeString(html));
        });
    };
  }

  njk.env.addExtension('FieldExtension', new FieldExtension());
};
