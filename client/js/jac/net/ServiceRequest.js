/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

//TODO: refactor duplicate code, the actual submit isn't very DRY

import ObjUtils from 'jac/utils/ObjUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import EventUtils from 'jac/utils/EventUtils';
import NetUtils from 'jac/utils/NetUtils';
import ServReqEvent from 'jac/net/events/ServReqEvent';
import ServReqProgressEvent from 'jac/net/events/ServReqProgressEvent';
import ServReqErrorEvent from 'jac/net/events/ServReqErrorEvent';
    export default (function(){
    
        /**
         * Creates a ServiceRequest object
         * Default protocol is http and default port is 80
         * @param {String} $url
         * @param {Object|String} [$reqBody] Key:Val pairs to use as request parameters OR plain string to pass in body. Defaults to empty string
         * @param {String|'GET'} [$reqMethod] Defaults to 'GET'
         * @param {String|'text'} [$responseType] Defaults to 'text'
         * @constructor
         */
        function ServiceRequest($url, $reqBody, $reqMethod, $responseType){
            //super
	        EventDispatcher.call(this);

	        //Private
	        var _url = $url;
			var _reqBody = ($reqBody === undefined)?'':$reqBody;
	        var _reqMethod = $reqMethod || 'GET';
			var _httpObj = NetUtils.makeHTTPObject();
			var _responseType = $responseType || 'text';

	        //Public
	        this.userName = null;
	        this.password = null;

	        this.isAsync = true;

			this.useContentType = true;
	        this.requestHeaders = {};

			this.responseType = _responseType;

			this.formData = null;

	        //set up events
	        var self = this;
		   	_httpObj.onreadystatechange = EventUtils.bind(self, self.onReadyStateChange, _httpObj);
		    _httpObj.onerror = EventUtils.bind(self, self.onError, _httpObj);	//This may not turn out to be useful
		    _httpObj.onprogress = EventUtils.bind(self, self.onProgress, _httpObj);
		    _httpObj.ontimeout = EventUtils.bind(self, self.onTimeOut, _httpObj);	//This may not turn out to be useful

	        //region Privileged Methods
	        this.getUrl = function(){
				return _url;
			};

			/**
	         * @returns {Object|String}
	         */
	        this.getReqBody = function(){
		      return _reqBody;
	        };

	        /**
	         * @returns {String=|'GET'}
	         */
	        this.getReqMethod = function(){
		      return _reqMethod.toUpperCase();
	        };

	        /**
	         * @returns {?Object} _httpObj
	         */
	        this.getHTTPObj = function(){
		        return _httpObj;
	        };

	        /**
	         * @returns {string} _urlVarsString;
	         */
	        this.getUrlVarsString = function(){
				if((typeof _reqBody).toLowerCase() === 'string'){
					return _reqBody;
				} else {
					return NetUtils.keyValObjToUrlParamString(_reqBody);
				}

	        };
	        //endregion

        }

	    //Do 'extend'
	    ObjUtils.inheritPrototype(ServiceRequest, EventDispatcher);

	    //Public methods
		ServiceRequest.prototype.send = function(){
			var http = this.getHTTPObj();

			if(this.getReqMethod() === 'GET'){

				//set up query string
				var query = '';
				var urlVarsString = this.getUrlVarsString();
				if(urlVarsString !== ''){
					query = '?' + urlVarsString;
				}

				http.open('GET', this.getUrl() + query, this.isAsync, this.userName, this.password);

				for(var header in this.requestHeaders){
					if(this.requestHeaders.hasOwnProperty(header)){
						http.setRequestHeader(header, this.requestHeaders[header]);
					}
				}

				http.responseType = this.responseType;
				http.send(null);

			}
			else if(this.getReqMethod() === 'POST'){
				http.open('POST', this.getUrl(), this.isAsync, this.userName, this.password);
				//Add content-type header to list
				if(!('Content-type' in this.requestHeaders) &&
				   !('content-type' in this.requestHeaders) &&
				   !('Content-Type' in this.requestHeaders) &&
				   (this.useContentType === true)){
					this.requestHeaders['Content-type'] = 'application/x-www-form-urlencoded';
				}

				//set request headers
				for(var headerKey in this.requestHeaders){
					if(this.requestHeaders.hasOwnProperty(headerKey)){
						http.setRequestHeader(headerKey, this.requestHeaders[headerKey]);
					}
				}

				//Append reqVars to formdata
				if(this.formData !== null){
					var reqBody = this.getReqBody();
					if(typeof reqBody === 'object'){
						for(var key in reqBody){
							if(reqBody.hasOwnProperty(key)){
								this.formData.append(key, reqBody[key]);
							}
						}
					}
					http.send(this.formData);
				} else {
					http.send(this.getUrlVarsString());
				}

			} else if(this.getReqMethod() === 'DELETE'){
                //set up query string
				var query1 = '';
				var urlVarsString1 = this.getUrlVarsString();
				if(urlVarsString !== ''){
					query1 = '?' + urlVarsString1;
				}

				http.open('DELETE', this.getUrl() + query1, this.isAsync, this.userName, this.password);

				for(var header1 in this.requestHeaders){
					if(this.requestHeaders.hasOwnProperty(header1)){
						http.setRequestHeader(header1, this.requestHeaders[header1]);
					}
				}

				http.responseType = this.responseType;
				http.send(null);
            }
		};

	    ServiceRequest.prototype.abort = function(){
			var http = this.getHTTPObj();
		    if(typeof http !== 'undefined'){
			    //Resets readyState to 0
			    http.abort();
		    }
	    };

	    ServiceRequest.prototype.onReadyStateChange = function($request){
		    var self = this;
			switch($request.readyState){
				case 4:
					//COMPLETE
					self.handleRequestComplete($request);
					break;
				case 0:
					//Request not initialized
					self.handleReadyState0($request);
					break;
				case 1:
					//Server Connection Established
					self.handleReadyState1($request);
					break;
				case 2:
					//Request Received
					self.handleReadyState2($request);
					break;
				case 3:
					//Processing Request
					self.handleReadyState3($request);
					break;
				default:
					throw new Error('Unhandled ReadyState: ' + $request.readyState);
					break;
			}

	    };

	    ServiceRequest.prototype.onError = function($request, $e){
		    this.dispatchEvent(new ServReqErrorEvent(ServReqErrorEvent.ERROR, $e, $request));
	    };

	    ServiceRequest.prototype.onProgress = function($request, $e){
		    this.dispatchEvent(new ServReqProgressEvent(ServReqProgressEvent.PROGRESS, $e, $request));
	    };

	    ServiceRequest.prototype.onTimeOut = function($request){
		    this.dispatchEvent(new ServReqTimeOutEvent(ServReqTimeOutEvent.TIME_OUT, $request));
	    };

	    ServiceRequest.prototype.handleRequestComplete = function($request){
		    this.dispatchEvent(new ServReqEvent(ServReqEvent.COMPLETE, $request));
	    };

	    ServiceRequest.prototype.handleReadyState0 = function($request){
		  //OVERRIDE ME
	    };

	    ServiceRequest.prototype.handleReadyState1 = function($request){
		  //OVERRIDE ME
	    };

	    ServiceRequest.prototype.handleReadyState2 = function($request){
		  //OVERRIDE ME
	    };

	    ServiceRequest.prototype.handleReadyState3 = function($request){
		    //OVERRIDE ME
	    };

		ServiceRequest.prototype.addRequestHeader = function($headerKey, $headerValue){
			this.requestHeaders[$headerKey] = $headerValue;
		};

        //Return constructor
        return ServiceRequest;
    })();
