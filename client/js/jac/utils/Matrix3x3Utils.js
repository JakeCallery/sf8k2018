/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
        var Matrix3x3Utils = {};

	    Matrix3x3Utils.makeTranslation = function($tx, $ty){
			return [
				1,   0,   0,
				0,   1,   0,
				$tx, $ty, 1
			];
	    };
        
        Matrix3x3Utils.makeRotation = function($angleInRadians){
	        var cos = Math.cos($angleInRadians);
	        var sin = Math.sin($angleInRadians);
	        return [
	            cos, -sin, 0,
		        sin,  cos, 0,
		        0,    0,   1
	        ];
        };

	    Matrix3x3Utils.makeScale = function($sx, $sy){
            return [
                $sx, 0,   0,
	            0,   $sy, 0,
	            0,   0,   1
            ];
	    };

	    Matrix3x3Utils.makeIdentity = function(){
		    return [
		        1, 0, 0,
			    0, 1, 0,
			    0, 0, 1
		    ];
	    };

	    Matrix3x3Utils.resetToIdentity = function($matrix){
		    $matrix[0] = 1;
		    $matrix[1] = 0;
		    $matrix[2] = 0;
		    $matrix[3] = 0;
		    $matrix[4] = 1;
		    $matrix[5] = 0;
		    $matrix[6] = 0;
		    $matrix[7] = 0;
		    $matrix[8] = 1;

	    };

	    Matrix3x3Utils.updateTranslation = function($transMat, $tx, $ty){
			$transMat[6] = $tx;
		    $transMat[7] = $ty;
	    };

	    Matrix3x3Utils.updateRotation = function($rotMat, $angleInRadians){
		    var cos = Math.cos($angleInRadians);
		    var sin = Math.sin($angleInRadians);
		    $rotMat[0] = cos;
		    $rotMat[1] = -sin;
		    $rotMat[3] = sin;
		    $rotMat[4] = cos;
	    };

	    Matrix3x3Utils.updateScale = function($scaleMat, $sx, $sy){
		    $scaleMat[0] = $sx;
		    $scaleMat[4] = $sy;
	    };

	    Matrix3x3Utils.multiply = function($dstMatrix, $matA, $matB){
		    var a00 = $matA[0];
		    var a01 = $matA[1];
		    var a02 = $matA[2];
		    var a10 = $matA[3];
		    var a11 = $matA[4];
		    var a12 = $matA[5];
		    var a20 = $matA[6];
		    var a21 = $matA[7];
		    var a22 = $matA[8];
		    var b00 = $matB[0];
		    var b01 = $matB[1];
		    var b02 = $matB[2];
		    var b10 = $matB[3];
		    var b11 = $matB[4];
		    var b12 = $matB[5];
		    var b20 = $matB[6];
		    var b21 = $matB[7];
		    var b22 = $matB[8];

		    $dstMatrix[0] = a00 * b00 + a01 * b10 + a02 * b20;
		    $dstMatrix[1] = a00 * b01 + a01 * b11 + a02 * b21;
		    $dstMatrix[2] = a00 * b02 + a01 * b12 + a02 * b22;
		    $dstMatrix[3] = a10 * b00 + a11 * b10 + a12 * b20;
		    $dstMatrix[4] = a10 * b01 + a11 * b11 + a12 * b21;
		    $dstMatrix[5] = a10 * b02 + a11 * b12 + a12 * b22;
		    $dstMatrix[6] = a20 * b00 + a21 * b10 + a22 * b20;
		    $dstMatrix[7] = a20 * b01 + a21 * b11 + a22 * b21;
		    $dstMatrix[8] = a20 * b02 + a21 * b12 + a22 * b22;
	    };

	    Matrix3x3Utils.multiplyNew = function($matA, $matB){
			var a00 = $matA[0];
			var a01 = $matA[1];
			var a02 = $matA[2];
			var a10 = $matA[3];
			var a11 = $matA[4];
			var a12 = $matA[5];
			var a20 = $matA[6];
			var a21 = $matA[7];
			var a22 = $matA[8];
			var b00 = $matB[0];
			var b01 = $matB[1];
			var b02 = $matB[2];
			var b10 = $matB[3];
			var b11 = $matB[4];
			var b12 = $matB[5];
			var b20 = $matB[6];
			var b21 = $matB[7];
			var b22 = $matB[8];
			return [a00 * b00 + a01 * b10 + a02 * b20,
			    a00 * b01 + a01 * b11 + a02 * b21,
			    a00 * b02 + a01 * b12 + a02 * b22,
			    a10 * b00 + a11 * b10 + a12 * b20,
			    a10 * b01 + a11 * b11 + a12 * b21,
			    a10 * b02 + a11 * b12 + a12 * b22,
			    a20 * b00 + a21 * b10 + a22 * b20,
			    a20 * b01 + a21 * b11 + a22 * b21,
			    a20 * b02 + a21 * b12 + a22 * b22];
	    };

	    Matrix3x3Utils.make2DProjection = function($width, $height){
		    return [
		        2/$width, 0,          0,
			    0,       -2/$height,  0,
			    -1,       1,          1
		    ];
	    };

        //Return constructor
        return Matrix3x3Utils;
    })();

