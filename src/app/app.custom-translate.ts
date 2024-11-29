
import {TranslateLoader} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import { map, Observable } from 'rxjs';

export class CustomLoader implements TranslateLoader {

	constructor(private http: HttpClient) {}

	public getTranslation(lang: String): Observable<any> {
		return this.http.get(`assets/i18n/${lang}.json`).pipe(map(
            (res: any) => {
                return res;
            }
		));
	}
}