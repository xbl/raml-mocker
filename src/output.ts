/* tslint:disable no-console */
import chalk from 'chalk';

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

export default class Output {
  static ERROR = 0;
  static SUCCESS = 1;
  static WARNING = 2;
  static processMessage = (message) => message.match(/(^.*)[\n]*([\w\W]*)/);

  host: string;
  successCount = 0;
  failCount = 0;

  constructor(host: string) {
    this.host = host;
    console.log(`HOST: ${this.host}`);
  }


  push = (type, message, request: {method: string, path: string }, beginTime: number) => {
    const [, title, validInfo] = Output.processMessage(message);
    const { color, icon } = typeMap[type];
    if (type === Output.ERROR) {
      this.failCount++;
    } else {
      this.successCount++;
    }
    const takeTime = (Date.now() - beginTime).toString();
    console.log(
      chalk`{${color} ${icon} 请求：[${request.method.toUpperCase()}]} {underline ${
        request.path
      }} {gray ${takeTime}ms}`,
    );
    console.log(chalk`{${color} ${title}}`);
    console.log(validInfo);
  }

  print = () => {
    console.log(chalk`{green ${this.successCount.toString()} tests passed}`);
    if (this.failCount > 0) {
      console.log(chalk`{red ${this.failCount.toString()} tests failed} `);
      process.exit(1);
    }
  }

}
