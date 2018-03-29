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
import LayoutManager from "./LayoutManager";
import VolPanTouchPadUI from "./VolPanTouchPadUI";
import JacEvent from 'jac/events/JacEvent';

//For Edge Support:
//https://github.com/babel/babel/issues/4075
import "core-js/fn/symbol/iterator.js";

//Import assets
import '../assets/favicons/favicons';
import '../assets/sounds/sounds';
//import '../assets/images/images';

//Import through loaders
import '../css/normalize.css';
import '../css/main.css';
import BasicPreloader from "./BasicPreloader";


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

//Hide for preload
let mainContainerDiv = document.getElementById('mainContainerDiv');

const images = require.context(
    '!!file-loader?name=./images/[hash]-[name].[ext]!../assets/images',
    true,
    /\.(svg|png)$/
);

let imageList = [];
images.keys().forEach(($key) => {
    l.debug('Value: ', images($key));
    imageList.push(images($key));
});

let preloader = new BasicPreloader(window);
preloader.addEventListener('imageLoaded', ($evt) => {
   l.debug('Image Loaded: ' + $evt.data);
   if(preloader.numTotal === preloader.numLoaded) {
       l.debug('DONE LOADING!');
       mainContainerDiv.style['visibility'] = 'visible';
       mainContainerDiv.style['display'] = 'none';
       //Awful workaround to get safari to show the images on load everytime
       setTimeout(() => {
           mainContainerDiv.style['display'] = 'block';
       },1000);

   }
});
preloader.preload(imageList);


//Setup UI
let lm = new LayoutManager(document, window);
let um = new UIManager(window);
let im = new InputManager(document);
let vp = new VolPanTouchPadUI(document);
let vm = new VizManager(document);
let pm = new PresetManager(document);

//Set up audio
let am = new AudioManager(window);
am.init()
.then(() => {
    return am.loadSound('drinkalone.m4a');
})
.then(() => {
    l.debug('Sound Loaded!');
})
.catch(($err) => {
    l.error('AM Init and Load Error: ', $err);
});
