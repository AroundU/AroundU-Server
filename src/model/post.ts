import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface PostModel extends mongoose.Document {
    _id?: number;
    description?: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
    upvotes: number;
    downvotes: number;
    comments: PostModel[];
}

let schema = new Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
});

export let postSchema = mongoose.model<PostModel>("post", schema, "posts", true);

export class PostCollection extends CollectionBase<PostModel> {
    constructor() {
        super(postSchema);
    }
}
