import { Request, Response, Router, NextFunction } from 'express';
import path from 'node:path';
import {authMiddleware} from "../middleware/auth.middleware";

export class PagesController {
  path = '/';

  router = Router();

  constructor() {
    this.checkRoutes();
  }

  private checkRoutes() {
    this.router.get('/', authMiddleware, this.main);
    this.router.get('/login', this.login);
    this.router.get('/register', this.register);
    this.router.get('/main', authMiddleware, this.main);
  }

  main(req: Request, res: Response) {
    res.sendFile(path.resolve(path.resolve(), './../web', 'dist/main.html'));
  }

  login(req: Request, res: Response) {
    res.sendFile(path.resolve(path.resolve(), './../web', 'dist/login.html'));
  }

  register(req: Request, res: Response) {
    res.sendFile(path.resolve(path.resolve(), './../web', 'dist/register.html'));
  }
}
