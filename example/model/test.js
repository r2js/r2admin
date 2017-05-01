const idValidator = require('mongoose-id-validator');

module.exports = (app) => {
  const { Validate } = app.service('System');
  const mongoose = app.service('Mongoose');
  const ObjectId = mongoose.Schema.Types.ObjectId;
  const { Schema } = mongoose;

  const votesSchema = new Schema({
    _id: false,
    user: { type: ObjectId, ref: 'test' },
    type: { type: String },
  });

  const linksSchema = new Schema({
    web: { type: String },
    apple: { type: String },
    google: { type: String },
  });

  const schema = new Schema({
    user: { type: ObjectId, ref: 'test' },
    name: { type: String },
    email: { type: String },
    slug: { type: String },
    description: { type: String },
    isEnabled: { type: String, default: 'n' },
    createdAt: { type: Date },
    workerCount: { type: Number, default: 0 },
    links: { type: linksSchema },
    votes: { type: [votesSchema] },
  });

  const attributes = {
    en: {
      user: 'User',
      name: 'Name',
      email: 'E-mail',
      slug: 'Slug',
      description: 'Description',
      isEnabled: 'Is Enabled?',
      createdAt: 'Created At',
      workerCount: 'Worker Count',
      links: 'Links',
      votes: 'Votes',
    },
  };

  const rules = {
    name: 'required|min:4',
    email: 'email',
    slug: 'alpha_dash',
    isEnabled: 'in:y,n',
  };

  schema.r2options = { attributes, rules };
  Validate(schema, { attributes, rules });

  schema.plugin(idValidator);
  const model = mongoose.model('test', schema);
  return model;
};
