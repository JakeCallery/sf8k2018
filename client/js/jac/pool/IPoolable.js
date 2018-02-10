/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
	    /**
	     * @interface
	     */
        var IPoolable = {};

        IPoolable.init = function($args){};
	    IPoolable.recycle = function(){};

        //Return constructor
        return IPoolable;
    })();

