import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response} from "express";
import { MySQLService } from '../services/mySQL.service';

interface user {
  login: string;
  id: number;
}

export function authMiddleware (req: Request, res: Response, next: NextFunction) {
  try {
    const jwtCookie = req.cookies.jwt;
    if (jwtCookie) {
      const decoded = <user>jwt.verify(jwtCookie, <string>process.env.JWT_SECRET);
      const loginInQuery = `SELECT * from user_table WHERE login = '${decoded.login}'`;
      const accessUser = MySQLService.getInstance();
      accessUser
        .read(loginInQuery)
        .then((result: any) => {
          if (result.length > 0) {
            req.user = decoded;
            next();
          } else {
            res.redirect(303, '/login');
          }
        })
        .catch(() => {
          res.redirect(303, '/login');
        });
    } else {
      res.redirect(303, '/login');
    }
  } catch {
    res.redirect(303, '/login');
  }
}
