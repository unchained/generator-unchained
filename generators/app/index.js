'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Ready to ${chalk.red('rock')}?`));
  }

  writing() {
    this.fs.copy(this.templatePath('./'), this.destinationPath('./'), {
      dot: true
    });
  }

  install() {
    this.installDependencies();
  }

  end() {}
};
