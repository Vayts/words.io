import express, { Request, Response } from 'express';
import { MySQLService } from '../services/mySQL.service';
import {authMiddleware} from "../middleware/auth.middleware";

export class UserController {
  path = '/user';

  router = express.Router();

  constructor() {
    this.checkRoutes();
  }

  checkRoutes() {
    this.router.get('/pts',authMiddleware, this.getPts);
  }

  getPts(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();
    const { user } = req;
    console.log(req.user)
    const query = `SELECT pts FROM user_table WHERE id ="${user.id}"`;
    dbRequest.read(query).then((response: any) => {
      res.status(200).send({pts: response[0].pts})
    });
  }
}
