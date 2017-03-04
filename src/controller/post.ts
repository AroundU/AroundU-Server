import { PostCollection, PostModel } from "../model/post";

module Controller {
    export class PostController {

        private static instance: PostController;

        private postCollection: PostCollection;

        public static getInstance() {
            if (!PostController.instance) {
                PostController.instance = new PostController();
            }
            return PostController.instance;
        }

        private constructor() {
            this.postCollection = new PostCollection();
        }

        public create(post: PostModel) {
            // upload medias to aws.
            return this.postCollection.create(post);
        }
    }
}

export = Controller;
