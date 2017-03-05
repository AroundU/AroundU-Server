import * as express from 'express';
import { UserController } from '../controller/user';
import { PostController } from '../controller/post';
import { UserCollection, UserModel } from '../model/user';
import { PostModel } from '../model/post';
import { HttpStatus } from '../model/http_status';

module Route {

    export class UserRoute {

        public router: express.Router;
        private userCollection: UserCollection;

        constructor() {
            this.router = express.Router();
            this.userCollection = new UserCollection();

            this.router.post("/register", this.register);
            this.router.get("/upvotes", this.getUpvotes);
        }

        private register(req: express.Request, res: express.Response) {
            if (!req.body["username"]) {
                res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter a username."});
            } else if (!req.body["password"]) {
                res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter a password."});
            } else {
                let userData: UserModel = <UserModel>{
                    username: req.body["username"],
                    password: req.body["password"]
                };
                UserController.getInstance().register(userData).then(function(user: UserModel) {
                    res.json({success: true, user: user, msg: "Successfully registered user!"});
                }).catch(function(err) {
                    res.json({success: false, err: err, msg: "Failed to register user."});
                });
            }
        }

        private getUpvotes(req: express.Request, res: express.Response) {
            PostController.getInstance().getUpvotes(req.user).then(function(posts: PostModel[]) {
                res.json({success: true, posts: posts});
            }).catch(function(err) {
                res.json({success: false, err: err});
            });
        }
    }
}

export = Route;
