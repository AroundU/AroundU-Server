import * as express from 'express';
import * as passport from 'passport';
import { Strategy } from 'passport-local';
import { AuthenticationController } from '../controller/auth';
import { UserCollection, UserModel } from '../model/user';
import { HttpStatus } from '../model/http_status';

module Route {

    export class AuthenticationRoute {

        public router: express.Router;
        private userCollection: UserCollection;

        constructor() {
            this.router = express.Router();
            this.userCollection = new UserCollection();

            passport.use(new Strategy({
                usernameField: 'username',
                passwordField: 'password'
            }, async (username: string, password: string, done) => {
                AuthenticationController.getInstance().login(username, password).then(function(user: UserModel) {
                    done(null, user);
                }).catch(function(err) {
                    done(null, false);
                });
            }));

            passport.serializeUser((user: UserModel, done) => {
                done(null, user._id);
            });

            passport.deserializeUser(async (id: number, done) => {
                let user = await this.userCollection.findById(String(id));
                done(null, user);
            });

            this.router.post("/login", passport.authenticate('local'), this.login.bind(this));
            this.router.delete("/logout", this.logout.bind(this));
        }

        private login(req: express.Request, res: express.Response) {
            res.json({success: true, user: req.user, msg: "Successfully logged in!"});
        }

        private logout(req: express.Request, res: express.Response) {
            req.session.destroy((err) => {
                if (err) {
                    res.status(HttpStatus.Internal_Server_Error).json({
                        success: false, err: err, msg: "Failed to log out."
                    });
                } else {
                    res.json({success: true, msg: "Successfully logged out!"});
                }
            });
        }
    }
}

export = Route;
