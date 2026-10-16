import path from 'node:path';
import { writeFile } from '#utils/file.js';

function status(sts) {
  return (data) => {
    const timestamp = (new Date()).toISOString();
    const fileexts = {
      object: 'txt',
      string: 'txt',
      number: 'txt',
    };

    return writeFile(path.join('./', `logs.${fileexts[typeof data]}`), `${JSON.stringify(data)}\n`, { flag: 'a+' });
  }
}

export function logInfo(data) {
  return status('INFO')(data);
}

export function logError(data) {
  return status('ERROR')(data);
}

