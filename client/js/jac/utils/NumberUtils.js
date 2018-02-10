export default (function(){
    var NumberUtils = {};

    /* From Here: http://www.jacklmoore.com/notes/rounding-in-javascript/ */
    NumberUtils.roundToDec = function($value, $decimals) {
        return Number(Math.round($value + 'e' + $decimals) + 'e-' + $decimals);
    };

    //Return constructor
    return NumberUtils;
})();
