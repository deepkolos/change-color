const commands = require('./src/commands');

function activate(context) {
  commands.register(context);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
