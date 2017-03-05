import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface Vote extends mongoose.Document {
    post: string;
    time: number;
}

export interface UserModel extends mongoose.Document {
    username: string;
    password: string;
    upvoted?: Vote[];
    downvoted?: Vote[];
}

let voteSchema = new Schema({
    post: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    }
});

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
        type: [voteSchema],
        required: false
    },
    downvoted: {
        type: [voteSchema],
        required: false
    }
});

export let userSchema = mongoose.model<UserModel>("user", schema, "users", true);

export class UserCollection extends CollectionBase<UserModel> {
    constructor() {
        super(userSchema);
    }
}
