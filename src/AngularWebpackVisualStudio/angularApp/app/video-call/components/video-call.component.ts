import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DataConnection, MediaConnection } from 'peerjs';
import * as Peer from 'peerjs';

import { ThingService } from './../../core/services/thing-data.service';
import { Thing } from './../../models/thing';

const SERVER_URL = 'localhost';
const SERVER_PORT = 9000;

@Component({
    selector: 'video-call',
    templateUrl: './video-call.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VideoCallComponent implements OnInit, OnDestroy {

    @ViewChild('myvideo') myVideo: ElementRef;

    private peer: Peer;
    private data$: Subscription;
    private connections: { [id: string]: DataConnection; } = {};
    anotherid: string;
    message: string
    mypeerid: string;
    things: Thing[] = [];
    myThing: Thing;
    chatOutput: string[] = [];

    constructor(
        private dataService: ThingService,
        private changeDetection: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.data$ = this.dataService.getAll().subscribe(data => {
            this.things = data;
            this.changeDetection.markForCheck();
        });
    }

    ngOnDestroy() {
        this.peer.disconnect();
        this.data$.unsubscribe();
    }

    pushMessage(msg: string) {
        this.chatOutput.push(msg);
        this.changeDetection.detectChanges();
    }

    selectUser(id: number) {
        const _this = this;
        const video = this.myVideo.nativeElement;

        this.myThing = this.things[id];
        this.mypeerid = this.myThing.name;
        this.peer = new Peer(this.mypeerid, { host: SERVER_URL, port: SERVER_PORT, path: '' });

        this.peer.on('connection', function (conn: DataConnection) {
            conn.on('data', function (data: string) {
                _this.pushMessage('From ' + conn.peer + ':' + data);
            });
        });

        const n = <any>navigator;

        n.getUserMedia = (n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia);

        this.peer.on('call', function (call: MediaConnection) {

            n.getUserMedia({ video: true, audio: true }, function (stream: any) {
                call.answer(stream);
                call.on('stream', function (remotestream: any) {
                    video.src = URL.createObjectURL(remotestream);
                    video.play();
                });
            }, function (err: any) {
                console.log('Failed to get stream', err);
            });
        });
    }

    connect() {
        this.connections[this.anotherid] = this.peer.connect(this.anotherid);
        this.connections[this.anotherid].on('open', function () {
            console.log('connected');
            this.connections[this.anotherid].send('Connected');
        });
    }

    send() {
        this.pushMessage('Me: ' + this.message);
        this.connections[this.anotherid].send(this.message);
    }

    videoconnect() {
        const video = this.myVideo.nativeElement;
        const localvar = this.peer;
        const fname = this.anotherid;

        // var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        const n = <any>navigator;

        n.getUserMedia = (n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia);

        n.getUserMedia({ video: true, audio: true }, function (stream: any) {
            const call = localvar.call(fname, stream);
            call.on('stream', function (remotestream: any) {
                video.src = URL.createObjectURL(remotestream);
                video.play();
            });
        }, function (err: any) {
            console.log('Failed to get stream', err);
        });


    }
}
