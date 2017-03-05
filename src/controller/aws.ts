import { S3, Credentials } from "aws-sdk";
import * as fs from "fs";

module Controller {

    export class AWSController {

        private static instance: AWSController;
        private aws: S3;
        private bucket: string;

        public static getInstance() {
            if (!AWSController.instance) {
                AWSController.instance = new AWSController();
            }
            return AWSController.instance;
        }

        private constructor() {
            this.aws = new S3({
                credentials: new Credentials(process.env.AWS_KEY, process.env.AWS_SECRET),
                region: 'us-east-2'
            });
            this.bucket = process.env.AWS_BUCKET;
        }

        public async sendData(key: string, data: fs.ReadStream, size?: number): Promise<string> {
            return new Promise<string>(async (resolve, reject) => {
                let s3Data: S3.PutObjectRequest = {
                    Bucket: this.bucket,
                    Key: key,
                    Body: data,
                    ACL: "public-read"
                };

                this.aws.putObject(s3Data, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve("https://" + this.bucket + ".s3.amazonaws.com/");
                    }
                });
            });
        }
    }
}
export = Controller;
