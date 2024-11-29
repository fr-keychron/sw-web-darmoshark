import { Storage } from './storage'
class LocalStorage extends Storage{
    constructor(){
        super(window.localStorage)
    }
}

export const localStorage = new LocalStorage()
