import chalk from 'chalk';
import fs from '@/util/fs';
import { resolve } from 'path';
import Config from '@/models/config';

const readConfigFile = async (configFile: string): Promise<string> => {
  const currentPath = process.cwd();
  try {
    return await fs.readFile(resolve(currentPath, `./${configFile}`), 'utf8');
  } catch (error) {
    throw new Error(`在当前目录 ${currentPath} 没有找到${configFile}配置文件`);
  }
};

const parseStrToConfig = (configFile: string, str: string): Config => {
  try {
    return JSON.parse(str) as Config;
  } catch (error) {
    throw new Error(`解析${configFile}配置文件出错，不是正确的 JSON 格式。`);
  }
};

const processConfigPath = (config: Config): Config => {
  config.raml = resolve(config.raml);
  config.controller = resolve(config.controller);
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map((plugin) => resolve(plugin));
  }
  return config;
};

export const loadConfig = async (): Promise<Config> => {
  try {
    const configFile = '.raml-config.json';
    const str = await readConfigFile(configFile);
    const config: Config = parseStrToConfig(configFile, str);
    return processConfigPath(config);
  } catch (error) {
    // tslint:disable-next-line no-console
    console.log(chalk`{red ${error.message}}`);
    process.exit(1);
    return Promise.reject(error);
  }
};
