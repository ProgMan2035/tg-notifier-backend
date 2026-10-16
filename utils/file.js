import fs from 'node:fs';
import path from 'node:path';

export function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export function writeFile(file, data, options = {}) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
