import { RouterModule, Routes } from '@angular/router';

import { VideoCallComponent } from './components/video-call.component';

const routes: Routes = [
    { path: '', component: VideoCallComponent }
];

export const VideoCallRoutes = RouterModule.forChild(routes);
