import {Observable} from "rxjs";
import {Result} from "../model";

export const TaskInsert = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
	if (!target.hasOwnProperty('_task_queue')) {
		target['_task_queue'] = []
	}
	const raw = descriptor.value;
	descriptor.value = function (...argv: any) {
		return new Observable(s => {
			const resp = Result.build()
			raw.apply(this, argv).subscribe((r: any) => {
				if (target['_task_queue'].length === 0) {
					r.data.task.subscribe()
				}
				target['_task_queue'].push(r.data)
				s.next(resp)
			})
		})
	}
}

export const TaskNext = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
	const raw = descriptor.value;
	descriptor.value = function (...argv: any) {
		const buf = argv[0]
		const uint8Arr = new Uint8Array(buf.buffer, 0, buf.byteLength);
		const result = raw.apply(this, argv)
		if (target['_task_queue'] && target['_task_queue'].length) {
			// if (result === target['_task_queue'][0].uid) {
			target['_task_queue'].shift()
			if (target['_task_queue'].length) {
				target['_task_queue'][0].task.subscribe()
			}
			// }
		}
	}
}
