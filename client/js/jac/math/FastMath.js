/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */
export default {
    abs($value){
        return ($value ^ ($value >> 31)) - ($value >> 31);
    }
}

