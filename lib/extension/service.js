const parse = require('./parser');

module.exports = (app, njk) => {
  function ServiceExtension() {
    this.tags = ['service'];
    this.parse = parse('service', this);

    this.run = (context, params = {}, options = {}, body, errorBody, cb) => {
      const { name, service, method } = params;
      let run;

      try {
        run = app.service(service)[method](options);
      } catch (e) {
        run = Promise.resolve();
      }

      if (!context.ctx.serviceData) {
        Object.assign(context.ctx, { serviceData: {} });
      }

      if (!run.then) {
        Object.assign(context.ctx.serviceData, { [name]: run });
        return cb(null);
      }

      return run.then((serviceData) => {
        Object.assign(context.ctx.serviceData, { [name]: serviceData });
        cb(null);
      })
        .catch(() => cb(null));
    };
  }

  njk.env.addExtension('ServiceExtension', new ServiceExtension());
};
