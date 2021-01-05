import { AfterViewInit, Component, Directive, OnInit, QueryList, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { UploadService } from '../services/upload.service';
import { catchError } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';
import { of } from 'rxjs';
import { FileUpload } from '../services/dto/file-upload.dto';
import { UPLOAD_ROUTE } from "../routes";
import { HeaderMappingInputInterface } from "@arthropodindex/common";
import { HeaderMap } from "../services/dto/header-map.dto";

@Component({
    selector: 'app-upload-mapper',
    templateUrl: './upload-mapper.component.html',
    styleUrls: ['./upload-mapper.component.less'],
})
export class UploadMapperComponent implements OnInit {
    private uploadID: string = '';
    private upload: FileUpload | null = null;

    mapping = new HeaderMap();
    result = "";

    public tableColumns = [
        'databaseField',
        'csvHeader'
    ];

    get allHeaders(): string[] {
        return Object.keys(this.mapping);
    }

    get csvHeaders(): string[] {
        return this.upload ? this.upload.headers : [];
    }

    get formOk(): boolean {
        if (this.upload) {
            for (let header of this.upload.requiredHeaders) {
                if (this.mapping.get(header) === '') {
                    return false;
                }
            }
        }
        else {
            return false;
        }

        return true;
    }

    constructor(
        private readonly currentRoute: ActivatedRoute,
        private readonly uploads: UploadService,
        private readonly alerts: AlertService,
        private readonly router: Router) { }

    ngOnInit() {
        if (this.currentRoute.snapshot.paramMap.has('id')) {
            this.uploadID = this.currentRoute.snapshot.paramMap.get('id') as string;
            this.uploads.findByID(this.uploadID).pipe(
                catchError((e) => {
                    this.alerts.showError(JSON.stringify(e));
                    return of(null);
                })
            ).subscribe((fileUpload) => {
                this.upload = fileUpload;
            });
        }
        else {
            this.router.navigate(['/']);
        }
    }

    onAutoMap() {
        for (let key of this.csvHeaders) {
            if (this.mapping.keys().includes(key)) {
                this.mapping.set(key, key);
            }
            else if (key === 'lat') {
                this.mapping.latitude = key;
            }
            else if (key === 'lng') {
                this.mapping.longitude = key;
            }
        }
    }

    onUpload() {
        this.uploads.mapUpload(this.uploadID, this.mapping).subscribe((r) => {
            this.result = JSON.stringify(r);
        });
    }

    onCancel() {
        this.router.navigate([UPLOAD_ROUTE]);
    }

    headerIsRequired(header: string): boolean {
        return !!this.upload && this.upload.requiredHeaders.includes(header);
    }
}
