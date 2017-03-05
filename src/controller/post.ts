import { PostCollection, PostModel } from "../model/post";
import { UserCollection, UserModel } from "../model/user";

module Controller {

    enum PostAction {
        UPVOTE = 0,
        UNUPVOTE = 1,
        DOWNVOTE = 2,
        UNDOWNVOTE = 3
    }

    interface PostVotePromise {
        user: UserModel;
        post: PostModel;
    }

    export class PostController {

        private static instance: PostController;

        private postCollection: PostCollection;
        private userCollection: UserCollection;

        public static getInstance() {
            if (!PostController.instance) {
                PostController.instance = new PostController();
            }
            return PostController.instance;
        }

        private constructor() {
            this.postCollection = new PostCollection();
            this.userCollection = new UserCollection();
        }

        public create(post: PostModel) {
            return this.postCollection.create(post);
        }

        public vote(id: string, action: PostAction, user: UserModel): Promise<PostVotePromise> {
            return new Promise<PostVotePromise>(async(resolve, reject) => {
                try {
                    let post: PostModel = await this.postCollection.findById(id);
                    switch (Number(action)) {
                        case PostAction.UPVOTE:
                            post.upvotes += 1;
                            if (user.upvoted) {
                                let index = user.upvoted.indexOf(post._id, 0);
                                if (index < 0) {
                                    user.upvoted.push(post._id);
                                }
                            } else {
                                user.upvoted = [post._id];
                            }
                            if (user.downvoted) {
                                let index = user.downvoted.indexOf(post._id, 0);
                                if (index > -1) {
                                    post.downvotes -= 1;
                                    user.downvoted.splice(index, 1);
                                }
                            }
                            break;
                        case PostAction.UNUPVOTE:
                            if (user.upvoted) {
                                let index = user.upvoted.indexOf(post._id, 0);
                                if (index > -1) {
                                    post.upvotes -= 1;
                                    user.upvoted.splice(index, 1);
                                }
                            }
                            break;
                        case PostAction.DOWNVOTE:
                            post.downvotes += 1;
                            if (user.upvoted) {
                                let index = user.downvoted.indexOf(post._id, 0);
                                if (index < 0) {
                                    user.downvoted.push(post._id);
                                }
                            } else {
                                user.upvoted = [post._id];
                            }
                            if (user.upvoted) {
                                let index = user.upvoted.indexOf(post._id, 0);
                                if (index > -1) {
                                    post.upvotes -= 1;
                                    user.upvoted.splice(index, 1);
                                }
                            }
                            break;
                        case PostAction.UNDOWNVOTE:
                            if (user.downvoted) {
                                let index = user.downvoted.indexOf(post._id, 0);
                                if (index > -1) {
                                    post.downvotes -= 1;
                                    user.downvoted.splice(index, 1);
                                }
                            }
                            break;
                    }
                    this.postCollection.update(post._id, post);
                    this.userCollection.update(user._id, user);
                    resolve({user: user, post: post});
                } catch (err) {
                    reject(err);
                }
            });
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
