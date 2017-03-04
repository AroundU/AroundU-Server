import * as express from 'express';
import { UserController } from '../controller/user';
import { UserCollection, UserModel } from '../model/user';
import { HttpStatus } from '../model/http_status';

module Route {

    export class UserRoute {

        public router: express.Router;
        private userCollection: UserCollection;

        constructor() {
            this.router = express.Router();
            this.userCollection = new UserCollection();

            this.router.post("/register", this.register);
        }

        private register(req: express.Request, res: express.Response) {
            if (!req.body["username"]) {
                res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter a username."});
            } else if (!req.body["password"]) {
                res.status(HttpStatus.Bad_Request).json({success: false, msg: "Please enter a password."});
            } else {
                let userData: UserModel = {
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
    }
}

export = Route;
