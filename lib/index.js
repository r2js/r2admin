module.exports = (app) => {
  return (req, res, next) => {
    res.render('admin/page/dashboard/index.html');
  };
};
