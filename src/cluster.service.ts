import { Injectable } from "@nestjs/common";
const cluster= require('cluster')
cluster.schedulingPolicy= cluster.SCHED_RR
@Injectable()
export class ClusterService {
    static clusterize(callback: Function){
        if(cluster.isMaster){
            console.log(`Master server started on ${process.pid}`);
            for (let i = 0; i < 2; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            })
        } else {
            console.log(`Cluster server started on ${process.pid}`)
            callback();
        }
    }
}