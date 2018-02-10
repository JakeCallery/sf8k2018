/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import InterfaceUtils from 'jac/utils/InterfaceUtils';
import ILinkedListable from 'jac/linkedList/ILinkedListable';
    export default (function(){
        /**
         * Creates a Node object for a linked list
         * @param {Object} [$obj] object to be stored in this node
         * @constructor
         */
        function Node($obj){
	        var self = this;
	        this.prev = null;
	        this.next = null;
	        this.obj = $obj;

	        if($obj !== undefined && $obj !== null && InterfaceUtils.objectImplements(this.obj, ILinkedListable)){
		        this.obj.linkedListNodeRef = self;
	        }

        }

        
        //Return constructor
        return Node;
    })();

