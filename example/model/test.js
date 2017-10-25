module.exports = (app) => {
  const { Validate } = app.service('System');
  const mongoose = app.service('Mongoose');
  const Plugin = app.service('PluginService');
  const ObjectId = mongoose.Schema.Types.ObjectId;
  const { Schema } = mongoose;

  const votesSchema = new Schema({
    _id: false,
    user: { type: ObjectId, ref: 'user' },
    type: { type: String },
  });

  const linksSchema = new Schema({
    web: { type: String },
    apple: { type: String },
    google: { type: String },
  });

  const schema = new Schema({
    user: { type: ObjectId, ref: 'user', display: 'email' },
    name: { type: String },
    email: { type: String },
    slug: { type: String },
    excerpt: { type: String, field: 'textArea' },
    description: { type: String, field: 'richText' },
    isEnabled: { type: String, default: 'n' },
    isDeleted: { type: Boolean },
    createdAt: { type: Date },
    expiredAt: { type: Date, field: 'dateTime' },
    workers: [{ type: ObjectId, ref: 'user', display: 'email' }],
    workerCount: { type: Number, default: 0 },
    links: { type: linksSchema },
    votes: { type: [votesSchema] },
    tags: { type: [String] },
    photo: { type: String, field: 'image' },
    photoArr: { type: [String], field: 'image' },
  }, {
    timestamps: true,
  });

  const attributes = {
    en: {
      user: 'User',
      name: 'Name',
      email: 'E-mail',
      slug: 'Slug',
      description: 'Description',
      isEnabled: 'Is Enabled?',
      isDeleted: 'Is Deleted?',
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
    isDeleted: 'boolean',
  };

  Validate(schema, { attributes, rules });
  schema.r2options = { attributes, rules };

  Plugin.plugins(schema, { patchHistory: { name: 'test' }, modelPatches: true });
  return mongoose.model('test', schema);
};
