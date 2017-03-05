import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
import { MediaModel } from '../model/media';
export let Schema = mongoose.Schema;

export interface PostModel extends mongoose.Document {
    _id?: string;
    parent?: string;
    media?: MediaModel;
    description?: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
    upvotes: number;
    downvotes: number;
    comments: PostModel[];
}

let schema = new Schema({
    parent: {
        type: String,
        required: false
    },
    media: {
        type: Object,
        required: false
    },
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
    comments: {
        type: [],
        required: false
    }
});

export let postSchema = mongoose.model<PostModel>("post", schema, "posts", true);

export class PostCollection extends CollectionBase<PostModel> {
    constructor() {
        super(postSchema);
    }
}
