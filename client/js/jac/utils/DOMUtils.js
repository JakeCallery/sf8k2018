/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
        var DOMUtils = {};

	    /**
	     * Returns a supported property from a list, or empty string if not found
	     * @param {array} $propList list of strings to find as props
	     * @param {document} [$doc = document]
	     * @returns {String} the name of the supported prop or empty string if not found
	     */
	    DOMUtils.getSupportedProp = function($propList, $doc){
		    var doc = $doc || document;
		    var root = doc.documentElement;

		    for(var i = 0; i < $propList.length; i++){
			    if($propList[i] in root.style){
				    return $propList[i];
			    }
		    }
		    return '';

	    };

	    DOMUtils.addClass = function($domEl, $className){
			var delimiter = '';
			if($domEl.className !== ''){
				delimiter = ' ';
			}
		    $domEl.className += delimiter + $className;
	    };

	    DOMUtils.removeClass = function($domEl, $className){
		    var regEx = new RegExp('(\\s|^)' + $className + '(\\s|$)');
		    $domEl.className = $domEl.className.replace(regEx,'');
	    };

	    DOMUtils.hasClass = function($domEl, $className){
		    var regEx = new RegExp('(\\s|^)' + $className + '(\\s|$)');
		    var result = $domEl.className.match(regEx);
			return (result !== null);
	    };

	    DOMUtils.replaceClass = function($domEl, $classString){
		    $domEl.className = $classString;
	    };

	    DOMUtils.toggleClass = function($domEl, $classString){
		    if(DOMUtils.hasClass($domEl, $classString)){
			    //remove
			    DOMUtils.removeClass($domEl, $classString);
		    } else {
			    //add class
			    DOMUtils.addClass($domEl, $classString);
		    }
	    };

		DOMUtils.getChildById = function($rootEl, $id){
			var children = [];
			DOMUtils.getAllChildren($rootEl, children);
			if(children){
				for(var i = 0; i < children.length; i++){
					if(children[i].id === $id){
						//found it
						return children[i];
					}
				}
			}
			return null;
		};

		DOMUtils.getDirectChildById = function($rootEl, $id){
			var children = $rootEl.childNodes;
			if(children){
				for(var i = 0; i < children.length; i++){
					if(children[i].id === $id){
						//found it
						return children[i];
					}
				}
			}
			return null;
		};

	    DOMUtils.getAllChildren = function($rootEl, $listToPopulate){
		    var children = $rootEl.childNodes;
		    if(children.length > 0){
			    for(var i = 0; i < children.length; i++){
				    var child = children[i];
				    $listToPopulate.push(child);
				    DOMUtils.getAllChildren(child, $listToPopulate);
			    }
		    }
	    };

	    DOMUtils.getChildrenByNodeName = function($rootEl, $listToPopulate, $nodeName){
		    var children = $rootEl.childNodes;
		    if(children.length > 0){
			    for(var i = 0; i < children.length; i++){
				    var child = children[i];
				    if(child.nodeName === $nodeName){
					    $listToPopulate.push(child);
				    }
				    DOMUtils.getChildrenByNodeName(child, $listToPopulate, $nodeName);
			    }
		    }
	    };

	    /**
	     * Fills or returns a list of child nodes of the rootElement that have the $className in it's class list
	     * @param {element} $rootElement dom element to start looking for children in
	     * @param {string} $className name of class the element must have to make the list
	     * @param {array=} $list a new list will be create if left undefined, other wise, elements are pushed on to given array
	     */
	    DOMUtils.getChildNodesByClassName = function($rootElement, $className, $list){
			$list = $list || [];

		    var childNodes = [];
		    DOMUtils.getAllChildren($rootElement, childNodes);
		    var currentClassNames = [];
		    for(var i = 0, l = childNodes.length; i < l; i++){
				//if(childNodes[i].hasOwnProperty('className')){
				if('className' in childNodes[i]){
					var className = childNodes[i].className;
					if(typeof(className) !== 'undefined'){
						currentClassNames = className.split(' ');
					}
					if(childNodes.length > 0 && currentClassNames.indexOf($className) !== -1){
						//found element with class, push to list
						$list.push(childNodes[i]);
					}
				}

		    }

		    return $list;

	    };

	    // Based on: http://www.quirksmode.org/js/findpos.html
	    DOMUtils.getCumulativeOffset = function ($element) {
		    var left, top;
		    left = top = 0;
		    if ($element.offsetParent) {
			    do {
				    left += $element.offsetLeft;
				    top  += $element.offsetTop;
			    } while ($element = $element.offsetParent);
		    }
		    return {
			    x : left,
			    y : top
		    };
	    };

	    DOMUtils.removeAllChildren = function($rootElement){
		    while($rootElement.lastChild){
			    $rootElement.removeChild($rootElement.lastChild);
		    }
	    };

	    DOMUtils.insertAfter = function($referenceElement, $newElement){
			$referenceElement.parentNode.insertBefore($newElement, $referenceElement.nextSibling);
		};

        //Return constructor
        return DOMUtils;
    })();

