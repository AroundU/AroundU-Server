import * as mongoose from 'mongoose';
import { CollectionBase } from "./database";
export let Schema = mongoose.Schema;

export interface MediaModel extends mongoose.Document {
    mimetype: string;
    name: string;
    size: number;
    url: string;
}

let schema = new Schema({
    mimetype: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
       type: String,
       required: true
    }
});

export let mediaSchema = mongoose.model<MediaModel>("media", schema, "medias", true);

export class MediaCollection extends CollectionBase<MediaModel> {
    constructor() {
        super(mediaSchema);
    }
}
