/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

export default class Point {
    /**
     * Creates a Point object
     * @param {Number} [$x=0]
     * @param {Number} [$y=0]
     * @constructor
     */
    constructor($x,$y){
        if($x === undefined){$x = 0;}
        if($y === undefined){$y = 0;}
        this.x = $x;
        this.y = $y;
    }
}

