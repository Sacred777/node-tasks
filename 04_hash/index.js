import { readFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const filePath = process.argv[2];

// eslint-disable-next-line consistent-return
async function getFileData(pathOfFile, errorCode, encoding = '') {
  try {
    const data = await readFile(pathOfFile, encoding);
    return data;
  } catch (err) {
    console.error('Ошибка при чтении файла', err);
    process.exit(errorCode);
  }
}

async function checkHashSum(pathOfFile, hashFunction) {
  // Получаем данны файла, полученного из командной строки
  const isAbsoluteFile = path.isAbsolute(pathOfFile);
  const absoluteFile = isAbsoluteFile ? pathOfFile : path.resolve(pathOfFile);

  const data = await getFileData(absoluteFile, 100);

  // Создаём хэш объект
  const hash = crypto.createHash(hashFunction);
  // В объект добавляем данные
  hash.update(data);
  // Получаем хеш в виде строки
  const hashedData = hash.digest('hex');

  // Получаем данные sha файла
  const hashFilePath = path.join(path.dirname(absoluteFile), `${path.basename(absoluteFile, path.extname(absoluteFile))}.${hashFunction}`);

  const hashFileData = (await getFileData(hashFilePath, 101, 'utf-8')).trim();

  if (hashedData !== hashFileData) {
    console.error(`Хеш сумма файла ${pathOfFile} НЕ соответствует файлу ${path.basename(pathOfFile, path.extname(pathOfFile))}.${hashFunction}`);
    process.exit(102);
  } else {
    console.log(`Хеш сумма файла ${pathOfFile} соответствует файлу ${path.basename(pathOfFile, path.extname(pathOfFile))}.${hashFunction}`);
  }
}

if (filePath) {
  checkHashSum(filePath, 'sha256');
} else {
  console.error('Не указан путь к файлу');
}
