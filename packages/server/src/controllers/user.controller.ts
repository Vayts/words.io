import express, { Request, Response } from 'express';
import { MySQLService } from '../services/mySQL.service';
import { authMiddleware } from '../middleware/auth.middleware';

export class UserController {
  path = '/user';

  router = express.Router();

  constructor() {
    this.checkRoutes();
  }

  checkRoutes() {
    this.router.get('/pts', authMiddleware, this.getPts);
    this.router.get('/last', authMiddleware, this.isLastGameWasFinished);
    this.router.get('/leaderboard', authMiddleware, this.getLeaderboard);
  }

  getPts(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    const { user } = req;
    const query = `SELECT pts FROM user_table WHERE id ="${user.id}"`;
    dbRequest.read(query).then((response: any) => {
      res.status(200).send({ pts: response[0].pts });
    });
  }

  isLastGameWasFinished(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    const { user } = req;
    const query = `SELECT * FROM user_table WHERE id ="${user.id}"`;
    dbRequest.read(query).then((response: any) => {
      if (response) {
        if (response[0].isPlaying === 1) {
          res.status(200).send({
            message: 'NOT_FINISHED',
            tryCounter: response[0].tryCounter,
            currentTry: response[0].currentTry,
            words: response[0].words,
            length: response[0].word.length,
            win: response[0].win,
            loose: response[0].loose,
          });
        } else {
          res.status(200).send({ message: 'FINISHED' });
        }
      }
    });
  }

  getLeaderboard(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    const { user } = req;
    dbRequest.read('SELECT login, pts FROM user_table ORDER BY pts DESC LIMIT 10').then((response: any) => {
      if (response) {

        const loginArr = response.map((el: any) => el.login);
        if (loginArr.includes(user.login)) {
          res.status(200).send({ message: 'USER_INCLUDED', board: response, user: { login: user.login } });
        } else {
          dbRequest.read(`SELECT login, pts FROM user_table ORDER BY pts DESC`).then((data: any) => {
            let userPts;
            let userPlace;
            data.find((el: any, index: number) => {
              if (el.login === user.login) {
                userPts = el.pts;
                userPlace = index;
              }
            })
            res.status(200).send({ message: 'USER_NOT_INCLUDED', board: response, user: { place: userPlace, login: user.login, pts: userPts } });
          });
        }
      }
    });
  }
}
