import {Injectable, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {delay} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable()
export class NoopInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (environment.httpDelay) {
            const randomDelay = Math.floor(Math.random() * Math.floor(environment.httpDelay));
            return next.handle(req).pipe(delay(randomDelay));
        } else {
            return next.handle(req);
        }
    }
}

@NgModule({
    declarations: [],
    imports: [HttpClientModule],
    exports: [HttpClientModule],
    providers: [
      {provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true},
    ],
})
export class AppHttpModule {
}
