import * as express from 'express';
import * as fs from 'fs';
import { AWSController } from '../controller/aws';
import { MediaController } from '../controller/media';
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
            //this.router.post("/:id/upvote", this.upvote);
            this.router.post("/comment/:id", this.createComment);
        }

        private async create(req: express.Request, res: express.Response) {
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                let media = null;
                if (req.file) {
                    let data = fs.createReadStream(req.file.path);
                    try {
                        let url = await AWSController.getInstance().sendData("images/" + req.file.filename, data);
                        media = await MediaController.getInstance().create({
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
                    let post = await PostController.getInstance().create({
                        media: media ? media : null,
                        description: req.body["description"],
                        latitude: req.body["latitude"],
                        longitude: req.body["longitude"],
                        timestamp: req.body["timestamp"],
                        upvotes: 0,
                        downvotes: 0,
                        comments: []
                    });
                    res.json({ success: true, post: post, msg: "Successfully created post" });
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                }
            }
        }

        private async createComment(req: express.Request, res: express.Response) {
            if (!req.body["latitude"] || !req.body["longitude"] || !req.body["timestamp"]) {
                res.json({ success: false, msg: "Please enter all required information." });
            } else {
                let media = null;
                if (req.file) {
                    let data = fs.createReadStream(req.file.path);
                    try {
                        let url = await AWSController.getInstance().sendData("images/" + req.file.filename, data);
                        media = await MediaController.getInstance().create({
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
                    let post = await PostController.getInstance().create({
                        parent: req.params["id"],
                        media: media ? media : null,
                        description: req.body["description"],
                        latitude: req.body["latitude"],
                        longitude: req.body["longitude"],
                        timestamp: req.body["timestamp"],
                        upvotes: 0,
                        downvotes: 0,
                        comments: []
                    });
                    let parent = await PostController.getInstance().getById(id);
                    if (parent.comments) {
                        parent.comments.push(post);
                    } else {
                        parent.comments = [ post ];
                    }
                    await PostController.getInstance().update(parent);
                    res.json({ success: true, post: post, msg: "Successfully created comment" });
                } catch (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({ success: false, err: err, msg: null });
                }
            }
        }

        // private upvote(req: express.Request, res: express.Response) {
        //     if (!req.params["id"]) {
        //         res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter an id"});
        //     } else {
        //         PostController.getInstance().upvote(req.params["id"]);
        //     }
        // }
    }
}

export = Route;
