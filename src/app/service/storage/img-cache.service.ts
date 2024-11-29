import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {zip} from "rxjs";

interface ImageCache {
	name: string
	load: boolean,
	cache: Record<string, HTMLImageElement>
}

@Injectable({providedIn: "root"})
export class ImgCacheService {
	private imgCache: Record<string, ImageCache> = {}

	public getStorage(name: string): ImageCache {
		return this.imgCache[name]
	}

	public get(storageName: string, name: string) {
		if (!Object.keys(this.imgCache).length) return null;
		const s = this.imgCache[storageName];
		if (s.cache[name]) {
			return s.cache[name]
		} else {
			return null
		}
	}

	public load(name: string, imgSrcArr: Array<string>): Observable<any> {
		return new Observable<any>(s => {
			const task: Array<Observable<any>> = [];
			this.imgCache[name] = {load: false, cache: {}, name: name}
			const map: Record<string, boolean> = {}
			imgSrcArr.forEach(i => {
				if( map[i] ) return
				map[i] = true
				task.push(new Observable(s => {
					const img = new Image()
					img.src = i;
					img.crossOrigin = 'anonymous'
					img.onload = () => {
						this.imgCache[name].cache[i] = img
						s.next()
					}
				}))
			})
			zip(task).subscribe(() => {
				this.imgCache[name].load = true
				s.next()
			})
		})
	}
}
