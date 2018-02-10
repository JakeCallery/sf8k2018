/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

export default class Vec2DObj {
    /**
     * Creates a Vec2DObj object (for use with Vec2D.js)
     * @param {Number} $x
     * @param {Number} $y
     * @param {Number} [$xOffset=0]
     * @param {Number} [$yOffset=0]
     * @constructor
     */
    constructor($x, $y, $xOffset, $yOffset) {
        if ($xOffset === undefined) {
            $xOffset = 0;
        }
        if ($yOffset === undefined) {
            $yOffset = 0;
        }
        this.x = $x;
        this.y = $y;
        this.xOffset = $xOffset;
        this.yOffset = $yOffset;
    }

    /**
     *
     * @returns {{x1: {Number}, y1: {Number}, x2: {Number}, y2: {Number}}}
     */
    getLineSeg() {
        return {x1: this.xOffset, y1: this.yOffset, x2: (this.x + this.xOffset), y2: (this.y + this.yOffset)};
    };

    updateFromLineSeg($x1, $y1, $x2, $y2) {
        this.xOffset = $x1;
        this.yOffset = $y1;
        this.x = $x2 - $x1;
        this.y = $y2 - $y1;
    };

    distanceFromOffset() {
        let diffX = this.x - this.xOffset;
        let diffY = this.y - this.yOffset;
        return Math.sqrt((diffX * diffX) + (diffY * diffY));
    };

    angleFromOffset() {
        return Math.atan2(this.y - this.yOffset, this.x - this.xOffset);
    };

    resetOffset() {
        this.x -= this.xOffset;
        this.y -= this.yOffset;
    };

    normalize() {
        this.resetOffset();
        let len = Math.sqrt((this.x * this.x) + (this.y * this.y));
        this.x = this.x / len;
        this.y = this.y / len;
    };
}
