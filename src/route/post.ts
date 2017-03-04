import * as express from 'express';
import { PostController } from '../controller/post';
import { PostCollection, PostModel } from '../model/post';
import { HttpStatus } from '../model/http_status';

module Route {

    export class UserRoute {

        public router: express.Router;
        private userCollection: PostCollection;

        constructor() {
            this.router = express.Router();
            this.userCollection = new PostCollection();

            this.router.post("/", this.create);
        }

        private create(req: express.Request, res: express.Response) {
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({success: false, msg: "Please enter all required information."});
            } else {
                let post: PostModel = {
                    description: req.body["description"],
                    latitude: req.body["latitude"],
                    longitude: req.body["longitude"],
                    timestamp: req.body["timestamp"],
                    upvotes: 0,
                    downvotes: 0,
                    comments: []
                }
                PostController.getInstance().create(post);
            }
        }
    }
}

export = Route;
