module.exports = {
  mongodb: {
    database: 'r2admin',
    debug: true,
    uri: 'mongodb://127.0.0.1:27017/r2admin',
  },

  jwt: {
    secret: '1234',
    expiresIn: 7,
  },

  admin: {
    enabled: true,
    models: {
      test: { nav: 'Test', icon: 'user-alt', model: 'test' },
    },
  },
};
