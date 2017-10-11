'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Ready to ${chalk.red('rock')}?`));
    this.log('Hey yo! So I heard you need some help setting up a project...');
    this.log('I might have to ask you few veeery important questions.');
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: "What's your name?"
      },
      {
        type: 'confirm',
        name: 'lookingForward',
        message: 'Are you looking forward to working on this project?',
        default: true
      },
      ...[
        {
          when: function(answers) {
            return answers.lookingForward;
          },
          type: 'list',
          name: 'motivation',
          message: "Good! Now, why do you wanna do it? What's so cool about it?",
          choices: [
            { name: 'The client is fckin awesome!', value: 'client' },
            { name: 'I love the product the webpage is about!', value: 'product' },
            { name: 'This job is veeery well paid', value: 'cash' },
            { name: "I'm doing it just for fun :)", value: 'fun' }
          ],
          default: 'product'
        },
        {
          when: function(answers) {
            return !answers.lookingForward;
          },
          type: 'list',
          name: 'motivation',
          message: "Oh come on... You're not doing this just for the money are you?",
          choices: [
            { name: 'Shut up and give me my project!', value: 'shutup' },
            { name: "Ahh, you're right, f*ck doing this.", value: 'giveup' },
            { name: 'I am, I need to buy that golden fidget spinner!', value: 'cash' },
            { name: "I'm not. That asshole made me work on this POS...", value: 'forced' }
          ],
          default: 'shutup'
        }
      ]
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;

      this.log(`Alright ${chalk.red(props.name)}!`);
      this.log(
        (function() {
          switch (props.motivation) {
            case 'client':
              return `Make the client impressed and amazed!`;
            case 'product':
              return `Get that sweet product out there!`;
            case 'cash':
              return `Enjoy that pile of cash... I hope it's really worth it.`;
            case 'fun':
              return `I'm looking forward to what you can come up with ^_^`;
            case 'shutup':
              return `I'm working on it... Geez, just calm down man.`;
            case 'giveup':
              return `Just enjoy the work you're doing! I'll make theproject anyway in case you find another passion.`;
            case 'forced':
              return `Heads up :) You're awesome! And if you really don't want to do this, just talk.`;
            default:
              return `Your project will be ready in few moments.`;
          }
        })()
      );
    });
  }

  writing() {
    this.fs.copy(this.templatePath('./'), this.destinationPath('./'));
  }

  install() {
    this.installDependencies();
  }

  end() {}
};
