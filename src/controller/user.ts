import * as bcrypt from 'bcrypt-nodejs';
import { UserCollection, UserModel } from "../model/user";

module Controller {
    export class UserController {

        private static instance: UserController;

        private userCollection: UserCollection;

        public static getInstance() {
            if (!UserController.instance) {
                UserController.instance = new UserController();
            }
            return UserController.instance;
        }

        private constructor() {
            this.userCollection = new UserCollection();
        }

        public register(userData: UserModel): Promise<UserModel> {
            return new Promise<UserModel>((resolve, reject) => {
                bcrypt.genSalt(10, (errSalt, salt) => {
                    if (errSalt) {
                        reject("Failed to generate password.");
                    } else {
                        bcrypt.hash(userData.password, salt, null, async (err, hash) => {
                            if (err) {
                                reject("Failed to generate password.");
                            } else {
                                userData.password = hash;
                                try {
                                    let user: UserModel = await this.userCollection.create(userData);
                                    resolve(user);
                                } catch (err) {
                                    reject(err);
                                }
                            }
                        });
                    }
                });
            });
        }
    }
}

export = Controller;
