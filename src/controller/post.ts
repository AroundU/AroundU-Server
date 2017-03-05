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
            return this.postCollection.create(post);
        }

        public getById(_id: string) {
            return this.postCollection.findById(_id);
        }

        public update(post: PostModel) {
            return this.postCollection.update(post._id, post);
        }
    }
}

export = Controller;
