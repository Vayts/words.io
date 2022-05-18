import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { analyseWord, getRandomNum } from '../utils/helpers';
import { MySQLService } from '../services/mySQL.service';
import { User } from '../interfaces/user.interface';
import { authMiddleware } from '../middleware/auth.middleware';

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
    const wordLength = reqArr[reqArr.length - 2];
    const tryCounter = reqArr[reqArr.length - 1];
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
      dbRequest.update(`UPDATE user_table SET ? WHERE ID = ${req.user.id}`, {
        word: arr[randomNum],
        isPlaying: true,
        tryCounter,
        currentTry: 0,
      });
      res.status(200).end();
    });
  }

  checkWord(req: Request, res: Response) {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      const dbRequest = MySQLService.getInstance();
      const word = data.slice(1, data.length - 1);
      let tryCounter: number;
      let currentTry: number;
      let userWord: string;
      let wordAnalyse: any;
      dbRequest
        .read(`SELECT word, tryCounter, currentTry FROM user_table WHERE ID = ${req.user.id}`)
        .then((value: User[]) => {
          tryCounter = value[0].tryCounter;
          currentTry = value[0].currentTry;
          userWord = value[0].word;
          wordAnalyse = analyseWord(word, userWord);
          return dbRequest.read(`SELECT word FROM words WHERE word = "${word.toLowerCase()}"`);
        })
        .then((value: any) => {

          if (userWord === word.toLowerCase()) {
            res.status(200).send({ message: 'WIN', wordAnalyse });
            return;
          }

          if (value.length < 1) {
            res.status(200).send({ message: 'WORD_DOESNT_EXIST' });
          } else {
            currentTry += 1;
            dbRequest.update(`UPDATE user_table SET ? WHERE id = ${req.user.id}`, { currentTry });
            if (currentTry !== tryCounter) {
              res.status(200).send({ message: 'WORD_EXIST', wordAnalyse });
            } else {
              res.status(200).send({ message: 'LOOSE', wordAnalyse });
            }
          }
        });
    });
  }
}

