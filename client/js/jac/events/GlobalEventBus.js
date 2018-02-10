/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class GlobalEventBus extends EventDispatcher{
    /**
     * Creates a GlobalEventBus Singleton object
     * to use ALWAYS new it up geb = new GlobalEventBus()
     * @extends {EventDispatcher}
     * @constructor
     */
    constructor(){
        super();
        if(!instance){
            instance = this;
        }
        return instance;
    }

}

