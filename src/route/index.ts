import * as express from 'express';

module Route {

    export class Index {

        public router: express.Router;

        constructor() {
            this.router = express.Router();

            this.router.get("/", this.index);
        }

        private index(req: express.Request, res: express.Response) {

            res.render("index", {});
        }
    }
}

export = Route;
