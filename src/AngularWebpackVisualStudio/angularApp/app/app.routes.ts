import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'video-call', loadChildren: './video-call/video-call.module#VideoCallModule',
    }
];

export const AppRoutes = RouterModule.forRoot(routes);
