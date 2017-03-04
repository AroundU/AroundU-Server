import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface UserModel extends mongoose.Document {
    _id?: number;
    username: string;
    password: string;
}

let schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

export let userSchema = mongoose.model<UserModel>("user", schema, "users", true);

export class UserCollection extends CollectionBase<UserModel> {
    constructor() {
        super(userSchema);
    }
}
