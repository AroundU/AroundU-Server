import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
import { MediaModel } from '../model/media';
import { UserModel } from '../model/user';
export let Schema = mongoose.Schema;

export interface PostModel extends mongoose.Document {
    user?: string;
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
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    media: {
        type: Schema.Types.ObjectId,
        ref: 'media'
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
    upvotes: {
        type: Number,
        required: true
    },
    downvotes: {
        type: Number,
        required: true
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'post' }]
});

export let postSchema = mongoose.model<PostModel>("post", schema, "posts", true);

export class PostCollection extends CollectionBase<PostModel> {
    constructor() {
        super(postSchema);
    }

    public findByIdAndPopulate(_id) {
        return new Promise<PostModel>((resolve, reject) => {
            this._model.findById({ _id: _id }, (err: any, res: PostModel) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }).populate('user').populate('media').populate('comments');
        });
    }
}
