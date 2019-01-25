const chalk = require('chalk');

const typeMap = {
  '0': {
    color: 'red',
    icon: '✖'
  },
  '1': {
    color: 'green',
    icon: '✔'
  },
  '2': {
    color: 'yellow',
    icon: '!'
  }
};

function Output(host, maxCount) {
  this.host = host;
  this.maxCount = maxCount;
  this.successCount = 0;
  this.failCount = 0;

  console.log(`HOST: ${this.host}`);
  Output.prototype.push = (type, message, validInfo, request, beginTime) => {
    const { color, icon } = typeMap[type];
    if (type === Output.ERROR) {
      this.failCount++;
    } else {
      this.successCount++;
    }
    console.log(
      chalk`{${color} ${icon} 请求：[${request.method}]} {underline ${
        request.path
      }} {gray ${Date.now() -
        beginTime}ms} \n{${color} ${message}}\n${validInfo}`
    );
    this.print();
  };

  Output.prototype.print = () => {
    if (this.successCount + this.failCount < this.maxCount) return;
    console.log(chalk`{green ${this.successCount} tests passed}`);
    if (this.failCount > 0) {
      console.log(chalk`{red ${this.failCount} tests failed} `);
      process.exit(1);
    }
  };
}

Output.ERROR = 0;
Output.SUCCESS = 1;
Output.WARNING = 2;

module.exports = Output;
