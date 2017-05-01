const nunjucks = require('nunjucks');
const _ = require('underscore');
const parse = require('./parser');

const view = (tag, type, app, njk) => {
  function ViewExtension() {
    this.tags = [type];
    this.parse = parse(type, this);
    this.run = (context, name, options = {}, body, errorBody, cb) => {
      app.render(
        `admin/tag/${tag}/${type}.html`,
        Object.assign({ name }, options),
      (err, html) => {
        cb(null, new nunjucks.runtime.SafeString(html));
      });
    };
  }

  return njk.env.addExtension(`${type}Extension`, new ViewExtension());
};

module.exports = (app, njk) => {
  const component = _.partial(view, 'component', _, _, _);
  const field = _.partial(view, 'field', _, _, _);

  ['string', 'password'].map(val => field(val, app, njk));
  ['submit'].map(val => component(val, app, njk));
};
