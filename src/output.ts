/* eslint-disable  no-console */
import chalk from 'chalk';
import OutputRequest from '@/models/output-request';

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
  public static WARNING = 2;
  public static ERROR = 0;
  public static SUCCESS = 1;

  host: string;
  successCount = 0;
  failCount = 0;


  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  static processMessage = (message: string) => message.match(/(^.*)[\n]*([\w\W]*)/);

  constructor(host: string) {
    this.host = host;
    console.log(`HOST: ${this.host}`);
  }


  push = (type: number, outputRequest: OutputRequest, message = '') => {
    const { path​​, method, beginTime} = outputRequest;
    const [, title, validInfo] = Output.processMessage(message);
    const { color, icon } = typeMap[type];
    if (type === Output.ERROR) {
      this.failCount++;
    } else {
      this.successCount++;
    }
    const takeTime = (Date.now() - beginTime).toString();
    console.log(
      chalk`{${color} ${icon} 请求：[${method.toUpperCase()}]} {underline ${
        path
      }} {gray ${takeTime}ms}`,
    );
    console.log(chalk`{${color} ${title}}`);
    console.log(validInfo);
  };

  print = () => {
    console.log(chalk`{green ${this.successCount.toString()} tests passed}`);
    if (this.failCount > 0) {
      console.log(chalk`{red ${this.failCount.toString()} tests failed} `);
      process.exit(1);
    }
  };

}
