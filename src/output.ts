/* eslint-disable no-console */
const chalk = require('chalk');

const typeMap = {
  0: {
    color: 'red',
    icon: '✖',
  },
  1: {
    color: 'green',
    icon: '✔',
  },
  2: {
    color: 'yellow',
    icon: '!',
  },
};

export default function Output(host) {
  this.host = host;
  this.successCount = 0;
  this.failCount = 0;

  console.log(`HOST: ${this.host}`);
}

Output.processMessage = (message) => message.match(/(^.*)[\n]*([\w\W]*)/);

Output.prototype.push = (type, message, request, beginTime) => {
  const [, title, validInfo] = Output.processMessage(message);
  const { color, icon } = typeMap[type];
  if (type === Output.ERROR) {
    this.failCount++;
  } else {
    this.successCount++;
  }
  console.log(
    chalk`{${color} ${icon} 请求：[${request.method.toUpperCase()}]} {underline ${
      request.path
    }} {gray ${Date.now() - beginTime}ms}`,
  );
  console.log(chalk`{${color} ${title}}`);
  console.log(validInfo);
};

Output.prototype.print = () => {
  console.log(chalk`{green ${this.successCount} tests passed}`);
  if (this.failCount > 0) {
    console.log(chalk`{red ${this.failCount} tests failed} `);
    process.exit(1);
  }
};

Output.ERROR = 0;
Output.SUCCESS = 1;
Output.WARNING = 2;
