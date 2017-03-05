import { PostCollection, PostModel } from "../model/post";
import { UserCollection, UserModel, Vote } from "../model/user";
import { RedisController } from "./redis";

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

    interface PostRequest {
        pageNumber: number;
        pageSize: number;
        latitude: number;
        longitude: number;
    }

    export class PostController {

        private static instance: PostController;

        private postCollection: PostCollection;
        private userCollection: UserCollection;
        private maxDistance = 1000;

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
            return new Promise<PostVotePromise>(async (resolve, reject) => {
                try {
                    let post: PostModel = await this.postCollection.findById(id);
                    let time = Math.round((Date.now() - post.timestamp) / (1000 * 60));
                    let key = post._id + "-" + String(time);
                    switch (Number(action)) {
                        case PostAction.UPVOTE:
                            post.upvotes += 1;
                            RedisController.getInstance().increment("upvote:" + key);
                            if (user.upvoted) {
                                let index = user.upvoted.findIndex(vote => vote.post === post._id);
                                if (index < 0) {
                                    user.upvoted.push(<Vote> {
                                        post: post._id,
                                        time: Date.now()
                                    });
                                }
                            } else {
                                user.upvoted = [<Vote> {
                                    post: post._id,
                                    time: Date.now()
                                }];
                            }
                            if (user.downvoted) {
                                let index = user.downvoted.findIndex(vote => vote.post === post._id);
                                if (index > -1) {
                                    post.downvotes -= 1;
                                    user.downvoted.splice(index, 1);
                                    await RedisController.getInstance().decrement("downvote:" + key);
                                }
                            }
                            break;
                        case PostAction.UNUPVOTE:
                            if (user.upvoted) {
                                let index = user.upvoted.findIndex(vote => vote.post === post._id);
                                if (index > -1) {
                                    post.upvotes -= 1;
                                    user.upvoted.splice(index, 1);
                                    await RedisController.getInstance().decrement("upvote:" + key);
                                }
                            }
                            break;
                        case PostAction.DOWNVOTE:
                            post.downvotes += 1;
                            RedisController.getInstance().increment("downvote:" + key);
                            if (user.downvoted) {
                                let index = user.downvoted.findIndex(vote => vote.post === post._id);
                                if (index < 0) {
                                    user.downvoted.push(<Vote> {
                                        post: post._id,
                                        time: Date.now()
                                    });
                                }
                            } else {
                                user.upvoted = [<Vote> {
                                    post: post._id,
                                    time: Date.now()
                                }];
                            }
                            if (user.upvoted) {
                                let index = user.upvoted.findIndex(vote => vote.post === post._id);
                                if (index > -1) {
                                    post.upvotes -= 1;
                                    user.upvoted.splice(index, 1);
                                    await RedisController.getInstance().decrement("upvote:" + key);
                                }
                            }
                            break;
                        case PostAction.UNDOWNVOTE:
                            if (user.downvoted) {
                                let index = user.downvoted.findIndex(vote => vote.post === post._id);
                                if (index > -1) {
                                    post.downvotes -= 1;
                                    user.downvoted.splice(index, 1);
                                    await RedisController.getInstance().decrement("downvote:" + key);
                                }
                            }
                            break;
                    }
                    this.postCollection.update(post._id, post);
                    this.userCollection.update(user._id, user);
                    resolve({ user: user, post: post });
                } catch (err) {
                    reject(err);
                }
            });
        }

        public getById(_id: string) {
            return this.postCollection.findByIdAndPopulate(_id);
        }

        public update(post: PostModel) {
            return this.postCollection.update(post._id, post);
        }

        public getUpvotes(user: UserModel): Promise<PostModel[]> {
            return new Promise<PostModel[]>(async (resolve, reject) => {
                let postIds: string[] = [];
                for (let vote of user.upvoted) {
                    if (Date.now() - vote.time <= (1000 * 60 * 60 * 24)) {
                        postIds.push(vote.post);
                    }
                }
                try {
                    let posts: PostModel[] = await this.postCollection.find({_id: {$in: postIds}});
                    resolve(posts);
                } catch (err) {
                    reject(err);
                }
            });
        }

        public getPosts(userId: string): Promise<PostModel[]> {
            return new Promise<PostModel[]>(async (resolve, reject) => {
                try {
                    let posts: PostModel[] = await this.postCollection.find({user: userId});
                    resolve(posts);
                } catch (err) {
                    reject(err);
                }
            });
        }

        public getNewests(postRequest: PostRequest): Promise<PostModel[]> {
            return new Promise<PostModel[]>((resolve, reject) => {
                this.postCollection.findWithLimit({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(postRequest.longitude), Number(postRequest.latitude)]
                            },
                            $maxDistance: this.maxDistance
                        }
                    }
                }, null, {timestamp: -1}, Number(postRequest.pageNumber * postRequest.pageSize),
                    Number(postRequest.pageSize)).then(function(posts: PostModel[]) {
                    resolve(posts);
                }).catch(function(err) {
                    reject(err);
                });
            });
        }

        public getNearests(postRequest: PostRequest): Promise<PostModel[]> {
            return new Promise<PostModel[]>((resolve, reject) => {
                this.postCollection.findWithLimit({
                        position: {
                            $nearSphere: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [Number(postRequest.longitude), Number(postRequest.latitude)]
                                },
                                $maxDistance: this.maxDistance
                            }
                        }
                    }, null, null, Number(postRequest.pageNumber * postRequest.pageSize),
                    Number(postRequest.pageSize)).then(function(posts: PostModel[]) {
                    resolve(posts);
                }).catch(function(err) {
                    reject(err);
                });
            });
        }

        public getHotests(postRequest: PostRequest): Promise<PostModel[]> {
            return new Promise<PostModel[]>((resolve, reject) => {
                this.postCollection.findWithLimit({
                    position: {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [Number(postRequest.longitude), Number(postRequest.latitude)]
                            },
                            $maxDistance: this.maxDistance
                        }
                    }
                }).then(function(posts: PostModel[]) {
                    let postsScore: any[] = [];
                    for (let post of posts) {
                        let score = 0;
                        let time = Math.round((Date.now() - post.timestamp) / (1000 * 60));
                        for (let i = 0; i < 60 && time - i >= 0; ++i) {
                            let key = post._id + "-" + String(time - i);
                            try {
                                let up: any = RedisController.getInstance().get("upvote" + key);
                                let down: any = RedisController.getInstance().get("downvote" + key);
                                score += (up + down);
                            } catch (err) {
                                reject(err);
                            }
                        }
                        postsScore.push({post: post, score: score});
                    }
                    postsScore.sort(function(postScore1, postScore2) {
                        if (postScore1.score > postScore2.score) {
                            return 1;
                        }
                        if (postScore1.score < postScore2.score) {
                            return -1;
                        }
                        return 0;
                    });
                    resolve(posts);
                }).catch(function(err) {
                    reject(err);
                });
            });
        }
    }
}

export = Controller;
