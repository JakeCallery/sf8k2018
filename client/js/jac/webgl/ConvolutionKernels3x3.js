/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 * mostly lifted from http://games.greggman.com/game/webgl-image-processing/
 */


    export default (function(){

        var ConvolutionKernels3x3 = {};

	    ConvolutionKernels3x3.NONE = [
		    0, 0, 0,
		    0, 1, 0,
		    0, 0, 0
	    ];

	    ConvolutionKernels3x3.GAUSSIAN_BLUR = [
		    0.045, 0.122, 0.045,
		    0.122, 0.332, 0.122,
		    0.045, 0.122, 0.045
	    ];
	    ConvolutionKernels3x3.GAUSSIAN_BLUR_2 = [
		    1, 2, 1,
		    2, 4, 2,
		    1, 2, 1
	    ];

	    ConvolutionKernels3x3.GAUSSIAN_BLUR_3 = [
		    0, 1, 0,
		    1, 1, 1,
		    0, 1, 0
	    ];

	    ConvolutionKernels3x3.UNSHARPEN = [
		    -1, -1, -1,
		    -1,  9, -1,
		    -1, -1, -1
	    ];

	    ConvolutionKernels3x3.SHARPNESS = [
		    0,-1, 0,
		    -1, 5,-1,
		    0,-1, 0
	    ];

	    ConvolutionKernels3x3.SHARPEN = [
		    -1, -1, -1,
		    -1, 16, -1,
		    -1, -1, -1
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT = [
		    -0.125, -0.125, -0.125,
		    -0.125,  1,     -0.125,
		    -0.125, -0.125, -0.125
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT_2 = [
		    -1, -1, -1,
		    -1,  8, -1,
		    -1, -1, -1
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT_3 = [
		    -5, 0, 0,
		    0, 0, 0,
		    0, 0, 5
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT_4 = [
		    -1, -1, -1,
		    0,  0,  0,
		    1,  1,  1
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT_5 = [
		    -1, -1, -1,
		    2,  2,  2,
		    -1, -1, -1
	    ];

	    ConvolutionKernels3x3.EDGE_DETECT_6 = [
		    -5, -5, -5,
		    -5, 39, -5,
		    -5, -5, -5
	    ];

	    ConvolutionKernels3x3.SOBEL_HORIZONTAL = [
		    1,  2,  1,
		    0,  0,  0,
		    -1, -2, -1
	    ];

	    ConvolutionKernels3x3.SOBEL_VERTICAL = [
		    1,  0, -1,
		    2,  0, -2,
		    1,  0, -1
	    ];

	    ConvolutionKernels3x3.PREVIT_HORIZONTAL = [
		    1,  1,  1,
		    0,  0,  0,
		    -1, -1, -1
	    ];

	    ConvolutionKernels3x3.PREVIT_VERTICAL = [
		    1,  0, -1,
		    1,  0, -1,
		    1,  0, -1
	    ];

	    ConvolutionKernels3x3.BOX_BLUR = [
		    0.111, 0.111, 0.111,
		    0.111, 0.111, 0.111,
		    0.111, 0.111, 0.111
	    ];

	    ConvolutionKernels3x3.TRIANGLE_BLUR = [
		    0.0625, 0.125, 0.0625,
		    0.125,  0.25,  0.125,
		    0.0625, 0.125, 0.0625
	    ];

	    ConvolutionKernels3x3.EMBOS = [
		    -2, -1,  0,
		    -1,  1,  1,
		    0,  1,  2
	    ];

        //Return constructor
        return ConvolutionKernels3x3;
    })();

