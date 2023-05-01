const Handlebars = require('handlebars');

Handlebars.registerHelper('if_equal', function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});
