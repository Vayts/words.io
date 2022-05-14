import { App } from './app';
import { WordsController } from './controllers/words.controller';
import { AuthController } from './controllers/auth.controller';
import { PagesController } from './controllers/pages.controller';
import {UserController} from "./controllers/user.controller";

const app = new App([new WordsController(), new AuthController(), new PagesController(), new UserController()]);

app.start();
