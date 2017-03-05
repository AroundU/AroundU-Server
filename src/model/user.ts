import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface Vote {
    post: string;
    time: number;
}

export interface UserModel extends mongoose.Document {
    username: string;
    password: string;
    upvoted?: Vote[];
    downvoted?: Vote[];
}

let schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    upvoted: {
        type: [Object],
        required: false
    },
    downvoted: {
        type: [Object],
        required: false
    }
});

export let userSchema = mongoose.model<UserModel>("user", schema, "users", true);

export class UserCollection extends CollectionBase<UserModel> {
    constructor() {
        super(userSchema);
    }
}
