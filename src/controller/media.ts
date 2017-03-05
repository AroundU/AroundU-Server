import { MediaCollection, MediaModel } from "../model/media";

module Controller {

    export class MediaController {

        private static instance: MediaController;

        private mediaCollection: MediaCollection;

        public static getInstance() {
            if (!MediaController.instance) {
                MediaController.instance = new MediaController();
            }
            return MediaController.instance;
        }

        private constructor() {
            this.mediaCollection = new MediaCollection();
        }

        public create(media: MediaModel) {
            return this.mediaCollection.create(media);
        }
    }
}

export = Controller;
