/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import EventDispatcher from 'jac/events/EventDispatcher';
import ObjUtils from 'jac/utils/ObjUtils';
    export default (function(){
        /**
         * Creates a SpriteSheet object
         * @extends {EventDispatcher}
         * @constructor
         */
        function SpriteSheet($sheetImg,$cellWidth,$cellHeight,$numCols,$numRows,$sheetId){
            //super
            EventDispatcher.call(this);

	        //General Sheet Info
	        this.id = $sheetId;
	        this.sheetImg = $sheetImg;
	        this.cellWidth = $cellWidth;
	        this.cellHeight = $cellHeight;
	        this.numCols = $numCols;
	        this.numRows = $numRows;


        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(SpriteSheet,EventDispatcher);

	    SpriteSheet.prototype.getCellRectFromIndex = function($index,$rect){
		    if($rect === undefined){$rect = new Rectangle(0,0,1,1);}

		    var row = Math.floor($index / this.numCols);
		    var col = $index % this.numCols;

		    $rect.x = col * this.cellWidth;
		    $rect.y = row * this.cellHeight;
		    $rect.width = this.cellWidth;
		    $rect.height = this.cellHeight;

			return $rect;

	    };



        //Return constructor
        return SpriteSheet;
    })();

