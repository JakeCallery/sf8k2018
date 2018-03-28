import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import JacEvent from 'jac/events/JacEvent';

export default class BasicPreloader extends EventDispatcher {
    constructor($window) {
        super();

        l.debug('New Basic Preloader');

        this.window = $window;
        this.doc = this.window.document;

        this.numLoaded = 0;
        this.images = [];
    }

    preload($urlList) {
        for(let i = 0; i < $urlList.length; i++) {
            let image = new Image();
            image.addEventListener('load', ($evt) => {
                 this.numLoaded++;
                 this.dispatchEvent(new JacEvent('imageLoaded', image.src));
            });
            image.src = $urlList[i];
            this.images.push(image);
        }
    }

    get numTotal() {
        return this.images.length;
    }
}