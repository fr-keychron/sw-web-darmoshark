export interface IStorage {
	setItem(k: string, v: any): void,

	getItem(k: string): any

	removeItem(k: string): any

	clear(): any;
}

export class Storage {
	private storage: IStorage | undefined;

	static serialize(v: any) {
		if (v instanceof Array || v instanceof Object) return JSON.stringify(v)
		return v
	}

	constructor(storage: IStorage) {
		this.storage = storage;
	}

	private getStorage(): IStorage {
		return this.storage as IStorage
	}

	public set(k: string, v: any) {
		this.storage.setItem(k, Storage.serialize(v))
	}

	public get(k: string) {
		return this.storage.getItem(k)
	}
}
