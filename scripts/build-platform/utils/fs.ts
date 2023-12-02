import * as fs from 'fs/promises';
import { exitMessage } from './assert';

export async function safeReadJson<T = unknown>(
  file: string,
): Promise<T | undefined> {
  try {
    const val = await fs.readFile(file);
    return JSON.parse(val.toString('utf-8')) as T;
  } catch (ex) {
    console.error('Cannot read JSON file', file);
  }
}

export async function safeWriteJson(
  file: string,
  data: unknown,
): Promise<void> {
  try {
    await fs.writeFile(file, JSON.stringify(data), 'utf-8');
  } catch (ex) {
    console.error('Cannot write JSON file', file, ex);
  }
}

export async function readDirOrExit(dir: string, msg?: string) {
  try {
    return await fs.readdir(dir);
  } catch (exception) {
    return exitMessage(
      msg ?? `Unable to read directory at [${dir}]`,
      exception,
    );
  }
}

export async function readFileOrExit(file: string, msg?: string) {
  try {
    return await fs.readFile(file);
  } catch (exception) {
    return exitMessage(msg ?? `Unable to read file at [${file}]`, exception);
  }
}

export async function writeFileOrExit(
  file: string,
  data: string,
  msg?: string,
) {
  try {
    return await fs.writeFile(file, data, 'utf-8');
  } catch (exception) {
    return exitMessage(msg ?? `Unable to write file to [${file}]`, exception);
  }
}

export async function readJsonOrExit<T>(file: string, msg?: string) {
  const data = await readFileOrExit(file, msg);

  try {
    return JSON.parse(data.toString('utf-8')) as T;
  } catch (ex) {
    return exitMessage(msg ?? `Unable to read file at [${file}]`, ex);
  }
}
