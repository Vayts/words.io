import bcrypt from 'bcrypt';

import { Request, Response, Router } from 'express';
import { MySQLService } from '../services/mySQL.service';
import { generateJWT } from '../utils/helpers';

export class AuthController {
  path = '/auth';

  router = Router();

  constructor() {
    this.checkRoutes();
  }

  checkRoutes() {
    this.router.post('/register', this.register);
    this.router.post('/login', this.login);
  }

  register(req: Request, res: Response) {
    const dbRequest = MySQLService.getInstance();

    dbRequest
      .read(
        `SELECT *
             FROM user_table
             WHERE login = "${req.body.registerLogin}"`,
      )
      .then(async (response: any) => {
        if (response.length > 0) {
          return Promise.reject({ code: 403, message: 'LOGIN_IN_USE' });
        }

        const hashedPassword = await bcrypt.hash(req.body.registerPassword, 8);
        const query = 'INSERT INTO user_table SET ?';
        const column = {
          login: req.body.registerLogin,
          password: hashedPassword,
          pts: 1000,
          word: null,
          isPLaying: false,
        };

        return dbRequest.create(query, column);
      })
      .then(() => {
        res.redirect(302, '/main');
      })
      .catch((value: { code: number; message: string }) => {
        res.status(value.code).send({ message: value.message });
      });
  }

  login(req: Request, res: Response) {
    console.log(process.env['DB_USER ']);
    const dbRequest = MySQLService.getInstance();
    const query = `SELECT *
                   from user_table
                   WHERE login = "${req.body.loginInLogin}"`;
    dbRequest
      .read(query)
      .then(async (result: any) => {
        if (result.length > 0) {
          const checkPassword = await bcrypt.compare(req.body.loginInPassword, result[0].password);
          if (checkPassword) {
            generateJWT(res, result[0].id, result[0].login, result[0].role);
            return res.redirect(302, '/main');
          }
        }
        return Promise.reject({ code: 401, message: 'WRONG_LOGIN_PASSWORD' });
      })
      .catch((value: { code: number; message: string }) => {
        res.status(value.code).send({ message: value.message });
      });
  }
}
