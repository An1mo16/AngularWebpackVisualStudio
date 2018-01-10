import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DataConnection, MediaConnection } from 'peerjs';
import * as Peer from 'peerjs';

import { ThingService } from './../../core/services/thing-data.service';
import { Thing } from './../../models/thing';

const SERVER_URL = 'localhost';
const SERVER_PORT = 9000;

@Component({
    selector: 'video-call',
    templateUrl: './video-call.component.html'
})

export class VideoCallComponent implements OnInit, OnDestroy {

    @ViewChild('myCamera') myCamera: ElementRef;
    @ViewChild('partnersCamera') partnersCamera: ElementRef;

    private peer: Peer;
    private data$: Subscription;
    private connections: { [id: string]: DataConnection; } = {};
    myVideo: any;
    partnersVideo: any;
    callIsIncoming = false;
    ringing = false;
    currentCall: MediaConnection;
    myCurrentStream: any;
    receiverId: string;
    message: string
    mypeerid: string;
    users: Thing[] = [];
    chatOutput: string[] = [];
    n = <any>navigator;

    constructor(
        private dataService: ThingService,
        private changeDetection: ChangeDetectorRef
    ) {
        this.n.getUserMedia = (this.n.getUserMedia || this.n.webkitGetUserMedia || this.n.mozGetUserMedia || this.n.msGetUserMedia);
    }

    ngOnInit() {
        this.myVideo = this.myCamera.nativeElement;
        this.partnersVideo = this.partnersCamera.nativeElement;

        this.data$ = this.dataService.getAll().subscribe(data => {
            this.users = data;
        });
    }

    ngOnDestroy() {
        if (this.peer) {
            this.peer.disconnect();
        }

        this.data$.unsubscribe();
    }

    pushMessage(msg: string) {
        this.chatOutput.push(msg);
        this.changeDetection.detectChanges();
    }

    selectUser(index: number) {
        const _this = this;

        this.mypeerid = this.users[index].name;
        this.peer = new Peer(this.mypeerid, { host: SERVER_URL, port: SERVER_PORT, path: '' });

        this.peer.on('connection', function (conn: DataConnection) {
            conn.on('data', function (data: string) {
                _this.pushMessage('From ' + conn.peer + ':' + data);
            });
        });

        for (const user of this.users) {
            if (this.mypeerid !== user.name) {
                this.dataConnect(user.name);
            }
        }

        this.peer.on('call', function (call: MediaConnection) {
            _this.callIsIncoming = true;
            _this.currentCall = call;
            _this.setEvents();
        });
    }

    answer() {
        const _this = this;
        this.callIsIncoming = false;
        this.n.getUserMedia({ video: true, audio: true }, function (stream: any) {
            _this.currentCall.answer(stream);
            _this.myCurrentStream = stream;
            _this.setVideo(stream, _this.myVideo);
        }, function (err: any) {
            console.log('Failed to get stream', err);
        });
    }

    decline() {
        this.callIsIncoming = false;
        if (this.ringing) {
            this.stopCall();
        }
        this.currentCall.close();
    }

    stopCall() {
        this.ringing = false;
        this.stopVideo(this.myVideo);
        this.stopVideo(this.partnersVideo);
        for (const track of this.myCurrentStream.getTracks()) {
            track.stop()
        }
        this.changeDetection.detectChanges();
    }

    setVideo(stream: any, video: any) {
        video.src = URL.createObjectURL(stream);
        video.play();
    }

    stopVideo(video: any) {
        video.pause();
        video.src = '';
    }

    dataConnect(id: string) {
        this.connections[id] = this.peer.connect(id);
        this.connections[id].on('open', function () {
            console.log('connected to ' + id);
        });
    }

    send() {
        this.pushMessage('To ' + this.receiverId + ': ' + this.message);
        this.connections[this.receiverId].send(this.message);
    }

    videoconnect() {
        const _this = this;

        this.n.getUserMedia({ video: true, audio: true }, function (stream: any) {
            _this.currentCall = _this.peer.call(_this.receiverId, stream);
            _this.ringing = true;
            _this.myCurrentStream = stream;
            _this.setVideo(stream, _this.myVideo);
            _this.setEvents();
        }, function (err: any) {
            alert('Not connected');
            console.log('Failed to get stream', err);
        });
    }

    setEvents() {
        this.currentCall.on('close', function () {
            this.stopCall();
        }.bind(this))

        // got answer from the ohter side
        this.currentCall.on('stream', function (remoteStream: any) {
            this.ringing = false;
            this.setVideo(remoteStream, this.partnersVideo)
        }.bind(this));
    }
}
