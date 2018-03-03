import l from 'jac/logger/Logger';
import VerboseLevel from 'jac/logger/VerboseLevel';
import LogLevel from 'jac/logger/LogLevel';
import ConsoleTarget from 'jac/logger/ConsoleTarget';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import BrowserUtils from 'jac/utils/BrowserUtils';
import FeatureVerifier from 'FeatureVerifier';
import AudioManager from 'AudioManager';
import UIManager from 'UIManager';
import VizManager from 'VizManager';
import InputManager from 'InputManager';
import PresetManager from 'PresetManager';

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';
import LayoutManager from "./LayoutManager";

l.addLogTarget(new ConsoleTarget());
l.verboseFilter = (VerboseLevel.NORMAL | VerboseLevel.TIME | VerboseLevel.LEVEL);
l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);

//Set Debugging Via URL Query
let urlParams = BrowserUtils.getURLParams(window);
if(urlParams.hasOwnProperty('debug') && urlParams.debug === 'true'){
    l.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);
}

//Set up event buses
let geb = new GlobalEventBus();

l.debug('New Index Page');

//Check features
let fv = new FeatureVerifier();
let fvResponse = fv.verify();
if(fvResponse.length !== 0) {
    l.error('********** FEATURES NOT VERIFIED ***********');
    for(let i = 0; i < fvResponse.length; i++){
        l.error(fvResponse[i]);
    }
    l.error('********************************************')
} else {
    l.debug('All features Verified');
}

//Setup UI
let lm = new LayoutManager(document);
let um = new UIManager(document);
let im = new InputManager(document);
let vm = new VizManager(document);
let pm = new PresetManager(document);

//Set up audio
let am = new AudioManager(window);
am.init()
    .then(() => {
        return am.loadSound('drinkalone.ogg');
    })
    .then(() => {
        l.debug('Sound Loaded!');
    })
    .catch(($err) => {
        l.error('AM Init and Load Error: ', $err);
    });
