import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { InstitutionComponent } from './institution/institution.component';
import { CollectionComponent } from './collection/collection.component';
import { MapComponent } from './map/map.component';
import { COLLECTION_ROUTE, INSTITUTION_ROUTE, LIST_ROUTE, MAP_ROUTE, UPLOAD_ROUTE } from './routes';
import { UploadComponent } from './upload/upload.component';

const routes: Routes = [
    { path: `${INSTITUTION_ROUTE}/:id`, component: InstitutionComponent },
    { path: `${COLLECTION_ROUTE}/:id`, component: CollectionComponent },
    { path: LIST_ROUTE, component: ResourceListComponent },
    { path: UPLOAD_ROUTE, component: UploadComponent },
    { path: MAP_ROUTE, component: MapComponent },
    { path: "**", redirectTo: MAP_ROUTE }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
