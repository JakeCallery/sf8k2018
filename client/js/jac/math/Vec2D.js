/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 *
 * Modified version of http://www.cgrats.com/javascript-2d-vector-library.html
 * written by Tudor Nita | cgrats.com
 *
 */

import FastMath from 'jac/math/FastMath';
import Vec2DObj from 'jac/math/Vec2DObj';

export default {
	/**
	 * Static library for some 2D Vector Math stuff
	 * @static
	 */

    lengthOf($vec2D){
        return Math.sqrt(($vec2D.x * $vec2D.x) + ($vec2D.y * $vec2D.y));
    },

	multScalar($targetVec2D, $value){
		$targetVec2D.x *= $value;
		$targetVec2D.y *= $value;
	},

	multVector($targetVec2D, $vec2D){
		$targetVec2D.x *= $vec2D.x;
		$targetVec2D.y *= $vec2D.y;
	},

	divScalar($targetVec2D, $value){
		$targetVec2D.x /= $value;
		$targetVec2D.y /= $value;
	},

	addScalar($targetVec2D, $value){
		$targetVec2D.x += $value;
		$targetVec2D.y += $value;
	},

	addVector($targetVec2D, $vec2D){
		$targetVec2D.x += $vec2D.x;
		$targetVec2D.y += $vec2D.y;
	},

	subScalar($targetVec2D, $value){
		$targetVec2D.x -= $value;
		$targetVec2D.y -= $value;
	},

	subVector($targetVec2D, $vec2D){
		$targetVec2D.x -= $vec2D.x;
		$targetVec2D.y -= $vec2D.y;
	},

	abs($targetVec2D){
		$targetVec2D.x = FastMath.abs($targetVec2D.x);
		$targetVec2D.y = FastMath.abs($targetVec2D.y);
	},

	normalize($vec2D){
		let len = this.lengthOf($vec2D);
		$vec2D.x = $vec2D.x / len;
		$vec2D.y = $vec2D.y / len;
	},

	copy($srcVec2D, $targetVec2D){
		$targetVec2D.x = $srcVec2D.x;
		$targetVec2D.y = $srcVec2D.y;
		$targetVec2D.xOffset = $srcVec2D.xOffset;
		$targetVec2D.yOffset = $srcVec2D.yOffset;
	},

	duplicate ($vec2D){
		return new Vec2DObj($vec2D.x, $vec2D.y, $vec2D.xOffset, $vec2D.yOffset);
	},

	dot($vec2Da, $vec2Db){
		return ($vec2Da.x * $vec2Db.x) + ($vec2Da.y * $vec2Db.y);
	},

	scaledDot($vec2Da, $vec2Db){
		let len = this.lengthOf($vec2Db);
		return ($vec2Da.x * ($vec2Db.x / len) + ($vec2Da.y * ($vec2Db.y / len)));
	},

	projectVectorOnVector($targetVec2D, $vec2Da, $vec2Db){
		let dot = scaledDot($vec2Da, $vec2Db);
		let len = this.lengthOf($vec2Db);
		$targetVec2D.x = dot * ($vec2Db.x/len);
		$targetVec2D.y = dot * ($vec2Db.y/len);
	},

	calcLeftNormal($targetVec2D, $vec2D){
		$targetVec2D.x = $vec2D.y;
		$targetVec2D.y = -$vec2D.x;
	},

	calcRightNormal($targetVec2D, $vec2D){
		$targetVec2D.x = -$vec2D.y;
		$targetVec2D.y = $vec2D.x;
	},

	lengthSqrOf($vec2D){
		return (($vec2D.x * $vec2D.x) + ($vec2D.y * $vec2D.y));
	},

	lerp($targetVec2D, $vec2Da, $vec2Db, $value){
		$targetVec2D.x = $vec2Da.x + ($vec2Db.x-$vec2Da.x) * $value;
		$targetVec2D.y = $vec2Da.y + ($vec2Db.y - $vec2Da.y) * $value;
	},

	move($targetVec2D, $xOffset, $yOffset){
		$targetVec2D.xOffset = $xOffset;
		$targetVec2D.yOffset = $yOffset;
	},

	vecFromLineSeg($targetVec2D, $x1, $y1, $x2, $y2){
		let xDiff = $x2 - $x1;
		let yDiff = $y2 - $y1;

		$targetVec2D.x = xDiff;
		$targetVec2D.y = yDiff;
		$targetVec2D.xOffset = $x1;
		$targetVec2D.yOffset = $y1;
	},

	getAngle($vec2D){
		return Math.atan2($vec2D.y, $vec2D.x);
	},

	angleBetween($vec2Da, $vec2Db){
		let dot = this.dot($vec2Da, $vec2Db);
		dot = dot / (this.lengthOf($vec2Da) * this.lengthOf($vec2Db));
		return Math.acos(dot);
	},

	distBetween($vec2Da, $vec2Db){
		let xDiff = $vec2Db.x - $vec2Da.x;
		let yDiff = $vec2Db.y - $vec2Da.y;
		return Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
	}
}

