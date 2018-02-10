/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import LinkedList from 'jac/linkedList/LinkedList';
import ObjUtils from 'jac/utils/ObjUtils';
import Pool from 'jac/pool/Pool';
import PoolableNode from 'jac/linkedList/PoolableNode';
    export default (function(){
        /**
         * Creates a PooledLinkedList object
         * @extends {LinkedList}
         * @constructor
         */
        function PooledLinkedList(){
            //super
            LinkedList.call(this);

	        /**
	         * @type {Pool}
	         * @private
	         */
	        this._nodePool = new Pool(PoolableNode);

        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(PooledLinkedList,LinkedList);

	    /**
	     *
	     * @param {Object} $obj
	     */
	    PooledLinkedList.prototype.addNode = function($obj){
		    var n = this._nodePool.getObject($obj);

		    if(this.head === null){
			    this.head = n;
			    this.tail = this.head;
			    this.current = this.head;
		    } else {
			    this.tail.next = n;
			    n.prev = this.tail;
			    this.tail = n;
		    }

	    };

	    /**
	     *
	     * @param {Node} $node
	     */
	    PooledLinkedList.prototype.removeNode = function($node){
		    PooledLinkedList.superClass.removeNode.call(this, $node);
		    this._nodePool.recycle($node);
	    };

        //Return constructor
        return PooledLinkedList;
    })();

