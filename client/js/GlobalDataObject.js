import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class GlobalDataObject extends EventDispatcher {
    constructor() {
        super();
        if (!instance) {
            instance = this;
        }

        this.lowerAreaY = null;

        return instance;
    }
}