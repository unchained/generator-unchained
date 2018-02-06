'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`${chalk.red('</unchained')}`));
    const prompts = [
      {
        type: 'confirm',
        name: 'responsiveImages',
        message: 'Do you want to include image optimization?',
        default: true
      },
      {
        type: 'confirm',
        name: 'pageSpecificFiles',
        message: 'Do you want to have JS and CSS files per page?',
        default: false
      }
    ];

    return this.prompt(prompts).then(answers => {
      this.answers = answers;
      return answers;
    });
  }

  default() {
    if (this.answers.pageSpecificFiles) {
      this.sourceRoot(this.templatePath('./page-specific'));
    } else {
      this.sourceRoot(this.templatePath('./default'));
    }
  }

  writing() {
    this._writeDotFiles();
    this._writeGulpFile();
    this._writePackageJSON();
    this._writeConfigFiles();
    this._writeMiscFiles();
  }

  _writeDotFiles() {
    this.fs.copy(
      [this.templatePath('./.*'), '!' + this.templatePath('./.DS_Store')],
      this.destinationPath('./'),
      {
        globOptions: { dot: true }
      }
    );
  }

  _writeGulpFile() {
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      this.answers
    );
  }

  _writePackageJSON() {
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      this.answers
    );
  }

  _writeConfigFiles() {
    this.fs.copyTpl(
      this.templatePath('./config/**/*.*'),
      this.destinationPath('./config/'),
      this.answers
    );
  }

  _writeMiscFiles() {
    const miscFiles = [
      this.templatePath('./app.js'),
      this.templatePath('./app/**/*.*'),
      this.templatePath('./src/**/*.*')
    ];
    this.fs.copy(miscFiles, this.destinationPath('./'));
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false,
      callback: () => {
        this.spawnCommandSync('gulp', ['build']);
      }
    });
  }

  end() {
    console.log('done!');
  }
};
