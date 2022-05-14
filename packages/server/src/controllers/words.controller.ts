import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { analyseWord, getRandomNum } from '../utils/helpers';
import { MySQLService } from '../services/mySQL.service';
import { User } from '../interfaces/user.interface';
import {authMiddleware} from "../middleware/auth.middleware";

export class WordsController {
  path = '/word';

  router = Router();

  constructor() {
    this.checkRoutes();
  }

  checkRoutes() {
    this.router.get('/generate/*', authMiddleware, this.generateWord);
    this.router.post('/check', authMiddleware, this.checkWord);
  }

  generateWord(req: Request, res: Response) {
    const reqArr = req.url.split('/');
    const wordLength = reqArr[reqArr.length - 1];
    const dbRequest = MySQLService.getInstance();
    fs.readFile(`./words/words.txt`, 'utf-8', (err, data) => {
      if (err) {
        res.status(503).end();
      }
      const arr = data
        .replace(/\r?\n/g, ' ')
        .split(' ')
        .filter((el) => el.length === Number(wordLength));
      const randomNum = getRandomNum(0, arr.length - 1);
      dbRequest.update(`UPDATE user_table SET ? WHERE ID = ${req.user.id}`, { word: arr[randomNum], isPlaying: true });
      res.status(200).end();
    });
  }

  checkWord(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (data) {
        const word = data.slice(1, data.length - 1);
        dbRequest
          .read(`SELECT word FROM user_table WHERE ID = ${req.user.id}`)
          .then((value: User[]) => {
            if (value[0].word === word.toLowerCase()) {
              res.status(200).send({ message: 'WIN' });
            } else {
              fs.readFile(`./words/words${word.length}.txt`, 'utf-8', (err, response) => {
                if (err) {
                  res.status(503).end();
                }
                const arr = response.replace(/\r?\n/g, ' ').split(' ');
                if (arr.includes(word.toLowerCase())) {
                  const result = analyseWord(word, value[0].word);
                  const { partialMatch, fullMatch } = result;
                  res.status(200).send({ message: 'WORD_EXIST', partialMatch, fullMatch });
                } else {
                  res.status(200).send({ message: 'WORD_DOESNT_EXIST'});
                }
              });
            }
          })
          .catch((value: Error) => {
          });
      } else {
        res.status(503).end();
      }
    });
  }
}
