import * as shell from 'shelljs';

// Copy all the view templates
const template = 'har-convert/template';
shell.cp('-R', `src/${template}`, `dist/${template}`);
