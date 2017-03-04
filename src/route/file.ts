import * as express from 'express';
import * as fs from 'fs';
import { AWSController } from '../controller/aws';

module Route {

    export class File {

        public router: express.Router;

        constructor() {
            this.router = express.Router();

            this.router.post("/", this.uploadFile);
        }

        private async uploadFile(req: express.Request, res: express.Response) {

            if (req.file) {
                let data = fs.createReadStream(req.file.path);
                try {
                    let path = await AWSController.getInstance().sendData("images/test.png", data);
                    res.json({ success: true, path: path, msg: null, err: null });
                } catch (err) {
                    res.status(500).json({ success: false, msg: null, err: err });
                }

            } else {
                res.status(401).json({ success: false, msg: "Missing parameters", err: null });
            }
        }
    }
}

export = Route;
