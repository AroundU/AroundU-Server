import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface UserModel extends mongoose.Document {
    username: string;
    password: string;
    upvoted?: string[];
    downvoted?: string[];
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
        type: [String],
        required: false
    },
    downvoted: {
        type: [String],
        required: false
    }
});

export let userSchema = mongoose.model<UserModel>("user", schema, "users", true);

export class UserCollection extends CollectionBase<UserModel> {
    constructor() {
        super(userSchema);
    }
}
