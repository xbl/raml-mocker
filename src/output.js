const chalk = require('chalk');

function Output(host, maxCount) {
  this.host = host;
  this.maxCount = maxCount;
  this.logArr = [];
  this.valid = true;
  this.successCount = 0;
  this.failCount = 0;

  Output.prototype.push = (valid, message, validInfo, request, beginTime) => {
    let color = 'green';
    let icon = '✔';

    if (!valid) {
      color = 'red';
      icon = '✖';
      this.valid = false;
      this.failCount++;
    } else {
      this.successCount++;
    }
    this.logArr.push(
      chalk`{${color} ${icon} 请求：[${request.method}]} {underline ${
        request.path
      }} {gray ${Date.now() -
        beginTime}ms} \n{${color} ${message}}\n${validInfo}`
    );
    this.print();
  };

  Output.prototype.print = () => {
    if (this.logArr.length < this.maxCount) return;
    console.log(`HOST: ${this.host}`);
    this.logArr.forEach(_ => console.log(_));
    console.log(chalk`{green ${this.successCount} tests passed}`);
    if (this.failCount > 0) {
      console.log(chalk`{red ${this.failCount} tests failed} `);
    }
    process.exit(this.valid ? 0 : 1);
  };
}

module.exports = Output;
