import * as express from 'express';
import { PostController } from '../controller/post';
import { PostCollection, PostModel } from '../model/post';
import { HttpStatus } from '../model/http_status';

module Route {

    export class PostRoute {

        public router: express.Router;
        private postCollection: PostCollection;

        constructor() {
            this.router = express.Router();
            this.postCollection = new PostCollection();

            this.router.post("/", this.create);
            this.router.post("/:id/vote", this.vote);
        }

        private create(req: express.Request, res: express.Response) {
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({success: false, msg: "Please enter all required information."});
            } else {
                let postData: PostModel = {
                    description: req.body["description"],
                    latitude: req.body["latitude"],
                    longitude: req.body["longitude"],
                    timestamp: req.body["timestamp"],
                    upvotes: 0,
                    downvotes: 0,
                    comments: []
                };

                PostController.getInstance().create(postData).then(function(post: PostModel) {
                    res.json({success: true, post: post, msg: "Successfully created post!"});
                }).catch(function(err) {
                    res.json({success: false, err: err, msg: "Failed to create post."});
                });
            }
        }

        private vote(req: express.Request, res: express.Response) {
            if (!req.params["id"] || !req.body["action"]) {
                res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter an id"});
            } else {
                PostController.getInstance().vote(req.params["id"], req.body["action"], req.user)
                    .then(function(postVotePromise: any) {
                    res.json({
                        success: true,
                        user: postVotePromise.user,
                        post: postVotePromise.post,
                        msg: "Successfully voted on post!"
                    });
                }).catch(function(err) {
                    res.json({success: false, err: err, msg: "Failed to vote on post."});
                });
            }
        }
    }
}

export = Route;
