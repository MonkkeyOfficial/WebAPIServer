module.exports = (ex, type, message, se) => {
    return {
        type: type,
        message: msg,
        details: se
    }
}