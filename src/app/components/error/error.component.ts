import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
@Component({
    selector: 'error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
    public msg = ''
    constructor(
        private activeRoute: ActivatedRoute
    ) {
        this.activeRoute.queryParams.subscribe( (r: any) => {
            this.msg = r.m
        })
    }

}
