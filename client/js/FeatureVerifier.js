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
        if(!(window.AudioContext || window.webkitAudioContext)){
            notVerifiedList.push('AudioContext');
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

        return notVerifiedList;
    }
}