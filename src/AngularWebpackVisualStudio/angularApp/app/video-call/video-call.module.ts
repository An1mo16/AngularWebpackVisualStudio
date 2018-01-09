import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { VideoCallRoutes } from './video-call.routes';
import { VideoCallComponent } from './components/video-call.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        VideoCallRoutes
    ],

    declarations: [
        VideoCallComponent
    ],

})

export class VideoCallModule { }
