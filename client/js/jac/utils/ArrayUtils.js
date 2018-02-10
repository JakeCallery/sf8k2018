/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


export default {
    findFirstIndexObjWithProp: ($list, $propName, $propVal) => {
        for (let i = 0, l = $list.length; i < l; i++) {
            if ($list[i].hasOwnProperty($propName)) {
                if ($propVal === undefined) {
                    return i;
                } else if ($list[i][$propName] === $propVal) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * Returns the first object that has the specified property in the list
     * if $propVal is set, it will return the first object where the val of the prop matches
     * that param
     * @param {Array} $list
     * @param {String} $propName
     * @param {Object} [$propVal]
     * @returns {?Object}
     */
    findFirstObjWithProp: ($list, $propName, $propVal) => {
        for (let i = 0, l = $list.length; i < l; i++) {
            if ($list[i].hasOwnProperty($propName)) {
                if ($propVal === undefined) {
                    return $list[i];
                } else if ($list[i][$propName] === $propVal) {
                    return $list[i];
                }
            }
        }
        return null;
    },

    /**
     * Returns a list of objects that have the specified property, or if set,
     * returns a list of objects that have the property and the specified value
     * @param {Array} $list
     * @param {String} $propName
     * @param {Object} [$propVal]
     * @returns {Array}
     */
    findAllObjsWithProp: ($list, $propName, $propVal) => {
        let results = [];

        for (let i = 0, l = $list.length; i < l; i++) {
            if ($list[i].hasOwnProperty($propName)) {
                if ($propVal === undefined) {
                    results.push($list[i]);
                } else if ($list[i][$propName] === $propVal) {
                    results.push($list[i]);
                }
            }
        }
        return results;
    }

}

