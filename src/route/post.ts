import * as express from 'express';
import * as fs from 'fs';
import { AWSController } from '../controller/aws';
import { MediaController } from '../controller/media';
import { PostController } from '../controller/post';
import { PostCollection, PostModel } from '../model/post';
import { MediaModel } from '../model/media';
import { HttpStatus } from '../model/http_status';

module Route {

    export class PostRoute {

        public router: express.Router;
        private postCollection: PostCollection;

        constructor() {
            this.router = express.Router();
            this.postCollection = new PostCollection();

            this.router.post("/", this.create);
            this.router.post("/:id/comment", this.createComment);
            this.router.post("/:id/vote", this.vote);
            this.router.get("/newest/:longitude/:latitude/:pageNumber/:pageSize", this.getNewests);
        }

        private async create(req: express.Request, res: express.Response) {
            if (!req.isAuthenticated()) {
                res.status(HttpStatus.Unauthorized).json({ success: false });
                return;
            }
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                let media: MediaModel = null;
                if (req.file) {
                    let data = fs.createReadStream(req.file.path);
                    try {
                        let url = await AWSController.getInstance().sendData("images/" + req.file.filename, data);
                        media = await MediaController.getInstance().create(<MediaModel>{
                            mimetype: req.file.mimetype,
                            name: req.file.filename,
                            size: req.file.size,
                            url: url
                        });
                    } catch (err) {
                        res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                    }
                }
                try {
                    let post = await PostController.getInstance().create(<PostModel>{
                        user: req.user._id,
                        media: media ? media._id : null,
                        description: req.body["description"],
                        position: {
                            type: "Point",
                            coordinates: [Number(req.body["longitude"]), Number(req.body["latitude"])]
                        },
                        timestamp: req.body["timestamp"],
                        upvotes: 0,
                        downvotes: 0,
                        comments: []
                    });
                    res.json({
                        success: true, post: await PostController.getInstance().getById(post._id),
                        msg: "Successfully created post"
                    });
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                }
            }
        }

        private async createComment(req: express.Request, res: express.Response) {
            if (!req.isAuthenticated()) {
                res.status(HttpStatus.Unauthorized).json({ success: false });
                return;
            }
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                let media: MediaModel = null;
                if (req.file) {
                    let data = fs.createReadStream(req.file.path);
                    try {
                        let url = await AWSController.getInstance().sendData("images/" + req.file.filename, data);
                        media = await MediaController.getInstance().create(<MediaModel>{
                            mimetype: req.file.mimetype,
                            name: req.file.filename,
                            size: req.file.size,
                            url: url
                        });
                    } catch (err) {
                        res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                    }
                }
                try {
                    let id = req.params["id"];
                    let post = await PostController.getInstance().create(<PostModel>{
                        user: req.user._id,
                        parent: req.params["id"],
                        media: media ? media._id : null,
                        description: req.body["description"],
                        timestamp: req.body["timestamp"],
                        upvotes: 0,
                        downvotes: 0,
                        comments: []
                    });
                    let parent = await PostController.getInstance().getById(id);
                    if (parent.comments) {
                        parent.comments.push(post);
                    } else {
                        parent.comments = [post];
                    }
                    await PostController.getInstance().update(parent);
                    res.json({ success: true, post: post, msg: "Successfully created comment" });
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                }
            }
        }

        private vote(req: express.Request, res: express.Response) {
            if (!req.params["id"] || !req.body["action"]) {
                res.status(HttpStatus.Bad_Request).json({ success: false, msg: "Please enter an id" });
            } else {
                PostController.getInstance().vote(req.params["id"], req.body["action"], req.user)
                    .then(function (postVotePromise: any) {
                        res.json({
                            success: true,
                            user: postVotePromise.user,
                            post: postVotePromise.post,
                            msg: "Successfully voted on post!"
                        });
                    }).catch(function (err) {
                        res.json({ success: false, err: err, msg: "Failed to vote on post." });
                    });
            }
        }

        private getNewests(req: express.Request, res: express.Response) {
            if (!req.params["pageNumber"] || !req.params["pageSize"] || !req.params["latitude"]
                || !req.params["longitude"]) {
                res.json({success: false, msg: "Please enter all required information."});
            } else {
                PostController.getInstance().getNewests({
                    pageNumber: req.params["pageNumber"],
                    pageSize: req.params["pageSize"],
                    latitude: req.params["latitude"],
                    longitude: req.params["longitude"]
                }).then(function(posts: PostModel[]) {
                    res.json({success: true, posts: posts});
                }).catch(function(err) {
                    res.json({success: false, err: err});
                });
            }
        }
    }
}

export = Route;

// 45.384917
// -75.697128
