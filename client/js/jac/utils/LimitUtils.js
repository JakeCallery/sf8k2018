export default {
    debounce: ($waitTimeInMs, $finalFunc, $optImmediateFunc) => {
        let timeout = null;
        let immediateFired = false;

        return function() {
            let args = Array.from(arguments);
            let fn = () => {
                $finalFunc.apply(this, args);
            };

            if(typeof $optImmediateFunc !== 'undefined' && immediateFired !== true) {
                $optImmediateFunc.apply(this, args);
                immediateFired = true;
            }

            if(timeout !== null) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(fn, $waitTimeInMs);
        }
    },

    //TODO: debounceWithAdditionalArgs is NOT WELL TESTED!! USE WITH CAUTION
    debounceWithAdditionalArgs: ($waitTimeInMs, $finalFunc, $optFinalFuncArgList, $optImmediateFunc, $optImmediateFuncArgList) => {
        let timeout = null;
        let immediateFired = false;
        let finalArgList = [];
        let immediateArgList = [];

        return function () {
            let args = Array.from(arguments);
            if(typeof $optFinalFuncArgList !== 'undefined') {
                if(!Array.isArray($optFinalFuncArgList)) {
                    $optFinalFuncArgList = [$optFinalFuncArgList];
                }

                if(Array.isArray(args)){
                    finalArgList = args.concat($optFinalFuncArgList);
                } else {
                    finalArgList = $optFinalFuncArgList;
                }

            }

            if(typeof $optImmediateFuncArgList !== 'undefined') {
                if(!Array.isArray($optImmediateFuncArgList)) {
                    $optImmediateFuncArgList = [$optImmediateFuncArgList];
                }

                if(Array.isArray(args)){
                    immediateArgList = args.concat($optImmediateFuncArgList);
                } else {
                    immediateArgList = $optImmediateFuncArgList;
                }

            }

            let fn = () => {
                $finalFunc.apply(this, finalArgList);
            };

            if(typeof $optImmediateFunc !== 'undefined' && immediateFired !== true) {
                $optImmediateFunc.apply(this, immediateArgList);
                immediateFired = true;
            }

            if(timeout !== null) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(fn, $waitTimeInMs);
        }
    }

}