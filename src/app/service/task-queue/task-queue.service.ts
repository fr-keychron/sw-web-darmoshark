import {Injectable} from "@angular/core";
import {Observable, queue, Subscriber} from "rxjs";
import {NzModalService} from "ng-zorro-antd/modal";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class TaskQueueService {
	constructor(
		private model: NzModalService,
		private i18n: TranslateService
	) {
	}

	private queue: Record<string, {
		invoke: Observable<any>,
		cancel: Observable<any>
	}> = {}

	private last: string = "";

	public getLen(): number {
		return Object.keys(this.queue).length
	}

	public insert(o: { name: string, obs: Observable<any>, cancel?: Observable<any> }): number {
		const l = this.getLen();
		if (!this.queue.hasOwnProperty(o.name)) this.queue[o.name] = {invoke: null, cancel: null}
		this.queue[o.name].invoke = o.obs;
		if (o.cancel) this.queue[o.name].cancel = o.cancel;
		this.last = o.name
		return l
	}

	public remove(name: string): this {
		delete this.queue[name];
		return this;
	}

	public clear() {
		this.queue = {}
		this.last = '';
	}

	public exec(): Observable<boolean> {
		return new Observable(s => {
			const queue: Array<Observable<any>> = Object.keys(this.queue).map(k => this.queue[k].invoke)
			const complete = () => {
				this.clear()
				s.next(true)
			}
			const runOb = () => {
				if (!queue.length) return complete();
				const ob = queue.shift();
				if(ob){
					ob.subscribe(() => runOb())
				}
			}
			runOb()
		})
	}

	public genObr(fn: (s: Subscriber<any>) => void): Observable<any> {
		return new Observable(s => fn(s))
	}

	public confirm() {
		return new Observable(s => {
			if (this.getLen()) {
				this.model.confirm({
					nzIconType: '',
					nzCancelText: this.i18n.instant("common.not"),
					nzOkText: this.i18n.instant("common.is"),
					nzContent: this.i18n.instant("common.notSubmit"),
					nzOnCancel: () => {
						this.clear();
						s.next()
					},
					nzOnOk: () => this.exec().subscribe(() => s.next())
				})
			} else {
				this.clear()
				s.next()
			}
		})
	}

	public pop() {
		if (this.last && this.queue.hasOwnProperty(this.last)) {
			const last = this.queue[this.last]
			if (last.cancel) last.cancel.subscribe()
			delete this.queue[this.last];
			this.last = "";
		}
	}
}
