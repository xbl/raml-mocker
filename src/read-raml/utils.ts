import { parse } from 'url';

export const setProps = (obj, property, value) => {
  if (value) {
    obj[property] = value;
  }
};

export const getPathname = (url) => decodeURIComponent(parse(url).pathname);
