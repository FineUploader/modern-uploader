var context = require.context('../packages', true, /.+\.spec\.js(x?)?$/)
context.keys().forEach(context)
module.exports = context
