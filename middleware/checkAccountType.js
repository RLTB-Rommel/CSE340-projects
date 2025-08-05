function checkAccountType(req, res, next) {
  const type = req.session.accountType;

  if (type === 'Admin' || type === 'Employee') {
    return next();
  }

  req.flash('notice', 'You do not have permission to view this page.');
  return res.redirect('/');
}

module.exports = checkAccountType;