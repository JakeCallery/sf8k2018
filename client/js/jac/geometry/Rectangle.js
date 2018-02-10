/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


export default class Rectangle {
    /**
     * Creates a Rectangle object
     * @param {Number} $x
     * @param {Number} $y
     * @param {Number} $width
     * @param {Number} $height
     * @constructor
     */
    constructor($x, $y, $width, $height) {
        this.x = $x;
        this.y = $y;
        this.width = $width;
        this.height = $height;
    }

    getTop() {
        return this.y;
    };

    getBottom () {
        return this.y + this.height;
    };

    getLeft() {
        return this.x;
    };

    getRight() {
        return this.x + this.width;
    };

    intersectsRect($rect) {
        let xOverlap = false;
        let yOverlap = false;

        if ((this.x >= $rect.x && this.x <= $rect.x + $rect.width) ||
            $rect.x >= this.x && $rect.x <= this.x + this.width) {
            xOverlap = true;
        }

        if ((this.y >= $rect.y && this.y <= $rect.y + $rect.height) ||
            $rect.y >= this.y && $rect.y <= this.y + this.height) {
            yOverlap = true;
        }

        return xOverlap && yOverlap;

    };
}

