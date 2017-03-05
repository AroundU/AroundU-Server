import { RedisClient, createClient } from "redis";
import * as fs from "fs";

module Controller {

    export class RedisController {

        private static instance: RedisController;
        private client: RedisClient;

        public static getInstance() {
            if (!RedisController.instance) {
                RedisController.instance = new RedisController();
            }
            return RedisController.instance;
        }

        private constructor() {
            this.client = createClient('6379', 'lassondehacks.io');
            this.client.auth('RedisLH2017$');
        }

        public get(key: string) {
            return new Promise<any>((resolve, reject) => {
                this.client.get(key, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }

        public increment(key: string) {
            this.client.incr(key);
        }

        public decrement(key: string) {
            return new Promise<void>((resolve, reject) => {
                this.client.get(key, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (Number(data) > 0) {
                            this.client.decr(key);
                        }
                    }
                });
            });
        }
    }
}
export = Controller;

// Longitude 45.384917
// Latitude -75.697128
