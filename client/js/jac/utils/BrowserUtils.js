/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
        var BrowserUtils = {};

	    /**
	     * Return a key/val obj containing the query string params
	     * @param {window} [$window = window]
	     * @returns {Object}
	     */
	    BrowserUtils.getURLParams = function($window){
		    var win = $window || window;

		    var paramObj = {};
		    var query = win.location.search.substring(1);
		    var params = query.split('&');

		    for (var i=0; i<params.length; i++)
		    {//each key/value pair
			    var pos = params[i].indexOf('=');

			    if (pos > 0)
			    {//get key/val
				    var key = params[i].substring(0,pos);
				    var val = params[i].substring(pos+1);
				    paramObj[key] = val;
			    }//get key/val
		    }//each key/value pair

		    return paramObj;
	    };

	    /**
	     * Returns the window size and location
	     * @param {window} [$window = window]
	     * @param {document} [$document = document]
	     * @returns {{x: Number, y: Number, width: Number, height: Number}}
	     */
	    BrowserUtils.getViewportSize = function($window,$document){
		    var win = $window || window;
			var doc = $document || document;

		    var e = win;
		    var a = 'inner';
		    if ( !( 'innerWidth' in e ) )
		    {
			    a = 'client';
			    e = doc.documentElement || doc.body;
		    }

		    var xPos = ('screenLeft' in win)?win.screenLeft:win.screenX;
		    var yPos = ('screenTop' in win)?win.screenTop:win.screenY;

		    return { x:xPos, y:yPos, width : e[ a+'Width' ] , height : e[ a+'Height' ] }
	    };

	    BrowserUtils.setCookie = function($cName, $value, $expireDays, $path, $document){
		    if($document === undefined){$document = document;}
		    var exdate=new Date();
		    exdate.setDate(exdate.getDate() + $expireDays);
		    var cValue=encodeURI($value) + (($expireDays==null) ? '' : ';expires='+exdate.toUTCString());
		    cValue += (';path=' + $path);
		    var finalString = $cName + "=" + cValue;
		    console.log('Final Cookie String: ' + finalString);
		    $document.cookie = finalString;
	    };

	    BrowserUtils.getCookie = function($cName, $document){
		    if($document === undefined){$document = document;}
		    var i, x, y, cookies = document.cookie.split(";");
		    for(i = 0; i < cookies.length; i++) {
			    x = cookies[i].substr(0, cookies[i].indexOf("="));
			    y = cookies[i].substr(cookies[i].indexOf("=") + 1);
			    x = x.replace(/^\s+|\s+$/g, "");
			    if(x == $cName){
				    return encodeURI(y);
			    }
		    }

		    return null;
	    };

        //Return constructor
        return BrowserUtils;
    })();

