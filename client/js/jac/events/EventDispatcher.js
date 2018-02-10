/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 * Date: 4/16/13
 * Time: 2:45 PM
 * To change this template use File | Settings | File Templates.
 */
import JacEvent from 'jac/events/JacEvent';

export default class EventDispatcher {

    /**
     * Standard EventDispatcher object
     * @constructor
     */
    constructor() {
        /** @type {Array} */
        this.handlers = [];
    }

    /**
     * Adds a handler function to the list
     * @param {String} $type
     * @param {Function} $handler
     */
    addEventListener($type, $handler) {
        if (typeof this.handlers[$type] === 'undefined') {
            this.handlers[$type] = [];
        }

        this.handlers[$type].push($handler);
    };

    /**
     * Removes a handler function from the list, based on type/handler signature
     * @param {String} $type
     * @param {Function} $handler
     */
    removeEventListener($type, $handler) {
        if (this.handlers[$type] instanceof Array) {
            let handlersForType = this.handlers[$type];
            for (let i = 0, len = handlersForType.length; i < len; i++) {
                if (handlersForType[i] === $handler) {
                    //Found one, remove it from the list
                    handlersForType.splice(i, 1);
                    break;
                }
            }
        }
    };

    /**
     * Removes all handlers from this object
     */
    removeAllHandlers () {
        for (let type in this.handlers) {
            if (this.handlers.hasOwnProperty(type) && this.handlers[type] instanceof Array) {
                //clear
                this.handlers[type].length = 0;
            }
        }
    };

    /**
     * removes all handlers for the specified type
     * @param {String} $type
     */
    removeAllHandlersByType($type) {
        if (this.handlers[$type] instanceof Array) {
            this.handlers[$type] = [];
        }
    };

    /**
     * Fire an event to all attached handlers
     * @param {JacEvent|Event} $event
     */
    dispatchEvent($event) {
        if (typeof $event.target === 'undefined' || $event === null) {
            $event.target = this;
        }

        $event.currentTarget = this;

        if (this.handlers[$event.type] instanceof Array) {
            let handlersForType = this.handlers[$event.type];
            for (let i = 0, len = handlersForType.length; i < len; i++) {
                if (handlersForType.length > i) {
                    //function check can be removed for more effeciency
                    if(typeof(handlersForType[i]) !== 'function'){
                        throw('Handler not a function: ' + handlersForType[i]);
                    }
                    handlersForType[i]($event);
                } else {
                    break;
                }

            }
        }

    };

    /**
     * Bind a scope to a function (used mainly for callbacks and event handlers)
     * @param {Object} $scope
     * @param {Function} $function
     * @param {...} $argsToCurry to curry during the call
     * @returns {Function} bound function (delegate)
     * @static
     */
    static bind ($scope, $function, $argsToCurry) {
        let args = Array.prototype.slice.call(arguments, 2);
        return function () {
            return $function.apply($scope, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}
