const chalk = require('chalk');

function Output(host, maxCount) {
  this.host = host;
  this.maxCount = maxCount;
  this.successCount = 0;
  this.failCount = 0;

  console.log(`HOST: ${this.host}`);
  Output.prototype.push = (valid, message, validInfo, request, beginTime) => {
    let color = 'green';
    let icon = '✔';

    if (!valid) {
      color = 'red';
      icon = '✖';
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

module.exports = Output;
