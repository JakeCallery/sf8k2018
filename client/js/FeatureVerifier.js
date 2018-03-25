import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from "./jac/events/JacEvent";

export default class FeatureVerifier extends EventDispatcher {
    constructor(){
        super();
    }

    verify() {
        let notVerifiedList = [];

        //Audio Context
        let AudioContext = window.AudioContext || window.webkitAudioContext || false;
        if(!AudioContext){
            notVerifiedList.push('AudioContext');
        } else {
            let ac = new AudioContext();
            if(!('createBiquadFilter' in ac)){
                notVerifiedList.push('BiQuadFilter');
            }
        }

        //Fetch
        if(!(window.fetch)){
            notVerifiedList.push('Fetch');
        }

        //Promise
        if(typeof Promise === "undefined" || Promise.toString().indexOf("[native code]") === -1){
            notVerifiedList.push('Promise');
        }

        //RequestAnimationFrame
        if(!(window.requestAnimationFrame || window.mozRequestAnimationFrame ||
             window.webkitRequestAnimationFrame || window.msRequestAnimationFrame)){
            notVerifiedList.push('requestAnimationFrame');
        }

        //ElementFromPoint
        if(!window.document.elementFromPoint) {
            notVerifiedList.push('elementFromPoint');
        }

        return notVerifiedList;
    }
}