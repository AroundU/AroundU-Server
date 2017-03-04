'use strict';

import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as multer from 'multer';
import * as session from 'express-session';
import * as passport from 'passport';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as database from "./model/database";
import { Index } from './route/index';

export class Application {

    public app: express.Application;

    public static bootstrap(): Application {
        return new Application();
    }

    constructor() {
        database.initialize("ds051605.mlab.com:51605/lh_cuhacking", process.env.USERNAME_DB, process.env.PASSWORD_DB);
        this.app = express();
        this.config();

        this.routes();
    }

    private config() {
        this.app.set("views", path.join(__dirname, "../views"));
        this.app.set("view engine", "pug");

        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        //this.app.use(this.upload.single('file'));
        this.app.use(session({
            secret: 'lolcodebecausecatsaregood',
            resave: true,
            rolling: true,
            saveUninitialized: false,
            cookie: {
                maxAge: 60000 * 60 * 4
            }
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.use(cors());
    }

    public routes() {

        let index: Index = new Index();
        this.app.use("/", index.router);

        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            let err = new Error('Not Found');
            next(err);
        });

        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || 404);
            res.send({
                message: err.message,
                error: {}
            });
        });
    }
}
