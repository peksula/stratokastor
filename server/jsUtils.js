exports.objectToArray = function(object) {
    if (!Array.isArray(object)) {
        var array = []
        array.push(object)
        return array
    }
    return object
}
