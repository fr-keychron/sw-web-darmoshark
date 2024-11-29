import { Storage } from './storage'
class SessionStorage extends Storage{
    constructor(){
        super(window.sessionStorage)
    }
}

export const sessionStorage = new SessionStorage()