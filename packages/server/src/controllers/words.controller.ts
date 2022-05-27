import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { analyseWord, getGameValue, getRandomNum } from '../utils/helpers';
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
    this.router.get('/vocabulary', authMiddleware, this.getVocabulary);
    this.router.get('/delete/*', authMiddleware, this.deleteWordFromVocabulary);
    this.router.get('/admin/delete/*', authMiddleware, this.deleteWordByAdmin);
    this.router.get('/admin/add/*', authMiddleware, this.addWordByAdmin);
    this.router.get('/admin/reject/*', authMiddleware, this.rejectWordByAdmin);
    this.router.post('/check', authMiddleware, this.checkWord);
    this.router.post('/add', authMiddleware, this.addWord);
  }

  generateWord(req: Request, res: Response) {
    const reqArr = req.url.split('/');
    const wordLength = Number(reqArr[reqArr.length - 2]);
    const tryCounter = Number(reqArr[reqArr.length - 1]);
    const gameValue = getGameValue(wordLength, tryCounter);
    const dbRequest = MySQLService.getInstance();
    dbRequest.read(`SELECT word FROM gameword_table WHERE CHAR_LENGTH(word) = ${wordLength}`).then((response: any) => {
      const arr = response.map((el: any) => el.word).filter((el: any) => el.length === Number(wordLength));
      const randomNum = getRandomNum(0, arr.length - 1);
      dbRequest.update(`UPDATE user_table SET ? WHERE ID = ${req.user.id}`, {
        word: arr[randomNum],
        isPlaying: true,
        tryCounter,
        currentTry: 0,
        win: gameValue[0],
        loose: gameValue[1],
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
      let looseValue: number;
      let winValue: number;
      let userWord: string;
      let wordAnalyse: any;
      let userPts: number;
      let words: string;
      dbRequest
        .read(`SELECT * FROM user_table WHERE ID = ${req.user.id}`)
        .then((value: User[]) => {
          tryCounter = value[0].tryCounter;
          currentTry = value[0].currentTry;
          looseValue = value[0].loose;
          winValue = value[0].win;
          userWord = value[0].word;
          userPts = value[0].pts;
          words = value[0].words === null ? '' : value[0].words;
          wordAnalyse = analyseWord(word, userWord);
          return dbRequest.read(`SELECT word FROM words WHERE word = "${word.toLowerCase()}"`);
        })
        .then((value: any) => {
          if (userWord === word.toLowerCase()) {
            dbRequest.update(`UPDATE user_table SET ? WHERE id = ${req.user.id}`, {
              word: null,
              pts: userPts + winValue,
              isPlaying: false,
              tryCounter: 0,
              currentTry: 0,
              loose: 0,
              win: 0,
              words: null,
            });
            res.status(200).send({ message: 'WIN', wordAnalyse, userWord });
            return;
          }

          if (value.length < 1) {
            res.status(200).send({ message: 'WORD_DOESNT_EXIST' });
          } else {
            currentTry += 1;
            dbRequest.update(`UPDATE user_table SET ? WHERE id = ${req.user.id}`, {
              currentTry,
              words: `${words}${word.toLowerCase()}`,
            });
            if (currentTry !== tryCounter) {
              res.status(200).send({ message: 'WORD_EXIST', wordAnalyse });
            } else {
              dbRequest.update(`UPDATE user_table SET ? WHERE id = ${req.user.id}`, {
                word: null,
                pts: userPts - looseValue,
                isPlaying: false,
                tryCounter: 0,
                currentTry: 0,
                loose: 0,
                win: 0,
                words: null,
              });
              res.status(200).send({ message: 'LOOSE', wordAnalyse, userWord });
            }
          }
        });
    });
  }

  addWord(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    dbRequest
      .read(`SELECT * FROM words WHERE word = "${req.body.word}"`)
      .then((response: any) => {
        if (response.length > 0) {
          return Promise.reject({ code: 200, message: 'ALREADY_IN_VOCABULARY' });
        }
        return dbRequest.read(`SELECT * FROM vocabulary WHERE word = "${req.body.word}"`);
      })
      .then((response: any) => {
        if (response.length > 0) {
          return Promise.reject({ code: 200, message: 'ALREADY_UNDER_REVIEW' });
        }
        return dbRequest.create(`INSERT INTO vocabulary SET ?`, {
          word: req.body.word.toLowerCase(),
          user: req.user.id,
          status: 0,
          time: Date.now(),
        });
      })
      .then(() => dbRequest.read(`SELECT id FROM vocabulary WHERE word = "${req.body.word.toLowerCase()}"`))
      .then((response: any) => {
        res.status(200).send({ message: 'DONE', id: response[0].id });
      })
      .catch((value: any) => {
        res.status(value.code).send({ message: value.message });
      });
  }

  getVocabulary(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    const query =
      req.user.role === 'admin'
        ? 'SELECT * FROM vocabulary WHERE status = 0'
        : `SELECT * FROM vocabulary WHERE user = ${req.user.id}`;
    dbRequest
      .read(query)
      .then((response: any) => {
        res.status(200).send({ message: `${req.user.role.toUpperCase()}_DONE`, body: response });
      })
      .catch((value: any) => {
        res.status(value.code).send({ message: value.message });
      });
  }

  deleteWordFromVocabulary(req: Request, res: Response) {
    const reqArr = req.url.split('/');
    const wordID = Number(reqArr[reqArr.length - 1]);
    const dbRequest = MySQLService.getInstance();
    dbRequest
      .delete(`DELETE FROM vocabulary WHERE id = ${wordID} AND user = ${req.user.id}`)
      .then(() => {
        res.status(200).send({ message: 'DELETED' });
      })
      .catch((value: any) => {
        res.status(value.code).send({ message: value.message });
      });
  }

  deleteWordByAdmin(req: Request, res: Response) {
    if (req.user.role === 'admin') {
      const reqArr = req.url.split('/');
      const wordID = Number(reqArr[reqArr.length - 1]);
      const dbRequest = MySQLService.getInstance();
      dbRequest
        .delete(`DELETE FROM vocabulary WHERE id = ${wordID}`)
        .then(() => {
          res.status(200).send({ message: 'DELETED' });
        })
        .catch((value: any) => {
          res.status(value.code).send({ message: value.message });
        });
    }
  }

  addWordByAdmin(req: Request, res: Response) {
    if (req.user.role === 'admin') {
      const reqArr = req.url.split('/');
      const wordID = Number(reqArr[reqArr.length - 1]);
      const dbRequest = MySQLService.getInstance();
      let user: number;
      dbRequest
        .update(`UPDATE vocabulary SET ? WHERE id =${wordID}`, { status: 1 })
        .then(() => dbRequest.read(`SELECT word, user FROM vocabulary WHERE id = ${wordID}`))
        .then((response: any) => {
          console.log(response);
          user = response[0].user;
          return dbRequest.create(`INSERT INTO words SET ?`, { word: response[0].word });
        })
        .then(() => dbRequest.read(`SELECT pts FROM user_table WHERE id = ${user}`))
        .then((response: any) =>
          dbRequest.update(`UPDATE user_table SET ? WHERE id = ${user}`, { pts: response[0].pts + 3 }),
        )
        .then(() => {
          res.status(200).send({ message: 'DONE' });
        })
        .catch((value: any) => {
          res.status(value.code).send({ message: value.message });
        });
    }
  }

  rejectWordByAdmin(req: Request, res: Response) {
    if (req.user.role === 'admin') {
      const reqArr = req.url.split('/');
      const wordID = Number(reqArr[reqArr.length - 1]);
      const dbRequest = MySQLService.getInstance();
      let user: number;
      dbRequest
        .update(`UPDATE vocabulary SET ? WHERE id =${wordID}`, { status: 2 })
        .then(() => dbRequest.read(`SELECT user FROM vocabulary WHERE id = ${wordID}`))
        .then((response: any) => {
          user = response[0].user;
          return dbRequest.read(`SELECT pts FROM user_table WHERE id = ${user}`);
        })
        .then((response: any) =>
          dbRequest.update(`UPDATE user_table SET ? WHERE id = ${user}`, { pts: response[0].pts - 5 }),
        )
        .then(() => {
          res.status(200).send({ message: 'DELETED' });
        })
        .catch((value: any) => {
          res.status(value.code).send({ message: value.message });
        });
    }
  }
}
