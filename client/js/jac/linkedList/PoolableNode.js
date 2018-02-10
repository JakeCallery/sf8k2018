/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import Node from 'jac/linkedList/Node';
import ObjUtils from 'jac/utils/ObjUtils';
import IPoolable from 'jac/pool/IPoolable';
import InterfaceUtils from 'jac/utils/InterfaceUtils';
import ILinkedListable from 'jac/linkedList/ILinkedListable';
    export default (function(){
        /**
         * Creates a PoolableNode object
         * @implements {IPoolable}
         * @extends {Node}
         * @constructor
         */
        function PoolableNode(){
            //super
            Node.call(this);
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(PoolableNode,Node);

	    PoolableNode.prototype.init = function($args){
		    var self = this;
		    this.prev = null;
		    this.next = null;
		    this.obj = arguments[0];

		    if(this.obj !== undefined && this.obj !== null && InterfaceUtils.objectImplements(this.obj, ILinkedListable)){
			    this.obj.linkedListNodeRef = self;
		    }
	    };

	    PoolableNode.prototype.recycle = function(){
		    if(this.obj !== undefined && this.obj !== null && InterfaceUtils.objectImplements(this.obj, ILinkedListable)){
			    this.obj.linkedListNodeRef = null;
		    }

		    this.prev = null;
		    this.next = null;
		    this.obj = null;

	    };

        //Return constructor
        return PoolableNode;
    })();

