/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){

	    var WebGLUtils = {};

	    /**
	     * Converts a WebGL enum to a string
	     * @param {!WebGLContext} $gl The WebGLContext to use.
	     * @param {number} $value The enum value.
	     * @return {string} The enum as a string.
	     */
	    WebGLUtils.glEnumToString = function($gl, $value){
		    for (var p in gl) {
			    if(gl.hasOwnProperty(p)){
				    if (gl[p] == value) {
					    return p;
				    }
			    }
		    }
		    return "0x" + value.toString(16);
	    };

	    /**
	     * Gets a webGL context from the canvas element
	     * @param {!Canvas} $canvas the canvas element to get the context from
	     * @param {Array=} $optAttribs additional attributes to pass to getContext()
	     * @returns {!WebGLContext}
	     */
	    WebGLUtils.get3DContext = function($canvas, $optAttribs){
		    //First webGL Check
		    if(!window.WebGLRenderingContext){
			    return null;
		    }

		    //Try and grab context
		    var context = null;
		    var contextNames = ["webgl", "experimental-webgl"];
		    for(var i = 0; i < contextNames.length; i++){
			    try {
				    context = $canvas.getContext(contextNames[i], $optAttribs);
			    } catch(err){
				    //bad name, next...
			    }

			    if(context){
				    break;
			    }
		    }
		    return context
	    };

	    /**
	     * loads a webGL Shader into the webGL context
	     * @param {!WebGLContext} $context
	     * @param {string} $shaderSource the shader source
	     * @param {number} $shaderType the shader type
	     * @param {function(string)=} $errCallback
	     * @returns {?WebGLShader} the new shader object
	     */
	    WebGLUtils.loadShader = function($context, $shaderSource, $shaderType, $errCallback){
		    $errCallback = $errCallback || (function($err){throw new Error($err);});

		    //Create shader object
		    var shader = $context.createShader($shaderType);

		    //Load the shader source
		    $context.shaderSource(shader, $shaderSource);

		    //Compile the shader
		    $context.compileShader(shader);

		    //Check compile status
		    var compiled = $context.getShaderParameter(shader, $context.COMPILE_STATUS);
		    if(!compiled){
			    //Something went wrong during the shader compile
			    var lastError = $context.getShaderInfoLog(shader);
			    $errCallback('*** Error compiling shader: ' + shader + ': ' + lastError);
			    $context.deleteShader(shader);
			    return null;
		    }

		    return shader;

	    };

	    /**
	     * Creates and loads a new program into the context
	     * @param {!WebGLContext} $context
	     * @param {Array.<!WebGLShader>} $shaders
	     * @param {Array.<string>=} $attribs
	     * @param {Array.<number>=} $attribLocs
	     * @param {?function(string)=} $errCallback
	     * @returns {*}
	     */
	    WebGLUtils.loadProgram = function($context, $shaders, $attribs, $attribLocs, $errCallback){
	        $errCallback = $errCallback || (function($err){throw new Error($err);});

		    //Create new program object
		    var program = $context.createProgram();

		    //attach shaders
		    var i = null;
		    for(i = 0; i < $shaders.length; i++){
				$context.attachShader(program, $shaders[i]);
		    }

		    //Bind attributes at specified locations
		    if($attribs !== undefined && $attribs !== null){
				for(i = 0; i < $attribs.length; i++){
					$context.bindAttribLocation(
						program,
						$attribLocs ? $attribLocs[i] : i,
						$attribs[i]
					);
				}
		    }

		    //Link up new program to context
		    $context.linkProgram(program);

		    //Verify the link worked
		    var linked = $context.getProgramParameter(program, $context.LINK_STATUS);
		    if(!linked){
			    var lastError = $context.getProgramInfoLog(program);
			    $errCallback('*** Error in program linking: ' + lastError);
			    $context.deleteProgram(program);
			    return null;
		    }

		    return program;

	    };

	    // Add your prefix here.
	    WebGLUtils.browserPrefixes = [
		    "",
		    "MOZ_",
		    "OP_",
		    "WEBKIT_"
	    ];

	    /**
	     * Given an extension name like WEBGL_compressed_texture_s3tc
	     * returns the supported version extension, like
	     * WEBKIT_WEBGL_compressed_teture_s3tc
	     * @param {!WebGLContext} $context
	     * @param {string} $name Name of extension to look for
	     * @return {WebGLExtension} The extension or undefined if not
	     *     found.
	     */
	    WebGLUtils.getExtensionWithKnownPrefixes = function($context, $name) {
		    for (var ii = 0; ii < WebGLUtils.browserPrefixes.length; ++ii) {
			    var prefixedName = WebGLUtils.browserPrefixes[ii] + $name;
			    var ext = $context.getExtension(prefixedName);
			    if (ext) {
				    return ext;
			    }
		    }

		    return undefined;
	    };


	    /**
	     * Resize a canvas to match the size it's displayed.
	     * @param {!Canvas} $canvas The canvas to resize.
	     */
	    WebGLUtils.resizeCanvasToDisplaySize = function($canvas) {
		    if ($canvas.width != $canvas.clientWidth ||
			    $canvas.height != $canvas.clientHeight) {
			    $canvas.width = $canvas.clientWidth;
			    $canvas.height = $canvas.clientHeight;
		    }
	    };

        //Return constructor
        return WebGLUtils;
    })();

