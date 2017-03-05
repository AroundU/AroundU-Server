import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
import { MediaModel } from '../model/media';
export let Schema = mongoose.Schema;

export interface Position {
    type: string;
    coordinates: number[];
}

export interface PostModel extends mongoose.Document {
    user: string;
    parent?: string;
    media?: MediaModel;
    description?: string;
    position?: Position;
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
    user: {
        type: String,
        required: true
    },
    media: {
        type: Object,
        required: false
    },
    position: {
        type: Object,
        required: false
    },
    timestamp: {
        type: Date,
        required: true
    },
    upvotes: {
        type: Number,
        required: true
    },
    downvotes: {
        type: Number,
        required: true
    },
    comments: {
        type: [],
        required: false
    }
});

schema.index({location: "2dsphere"});

export let postSchema = mongoose.model<PostModel>("post", schema, "posts", true);

export class PostCollection extends CollectionBase<PostModel> {
    constructor() {
        super(postSchema);
    }
}
