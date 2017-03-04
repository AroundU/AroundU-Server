import * as bcrypt from 'bcrypt-nodejs';
import { UserCollection, UserModel } from "../model/user";

module Controller {

    export class AuthenticationController {

        private static instance: AuthenticationController;

        private userCollection: UserCollection;

        public static getInstance() {
            if (!AuthenticationController.instance) {
                AuthenticationController.instance = new AuthenticationController();
            }
            return AuthenticationController.instance;
        }

        private constructor() {
            this.userCollection = new UserCollection();
        }

        public async login(username: string, password: string): Promise<UserModel> {
            return new Promise<UserModel>((resolve, reject) => {
                this.userCollection.findOne({username: username}).then(function(user: UserModel) {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (isMatch && !err) {
                            resolve(user);
                        } else {
                            reject(err);
                        }
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
    }
}

export = Controller;
