import { promises } from "fs";
import {resolve} from 'path';

export async function* getFiles(dir: string): AsyncGenerator<string>  {
    const dirents = await promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else {
        yield res;
      }
    }
  }