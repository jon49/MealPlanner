; (function () {

    export function debounce(func, waitMilliseconds = 50, option) {
        let timeoutId;
        const options = Object.assign({
            isImmediate: false,
            runImmediatelyFirstTimeOnly: false
        }, option);
        return function (...args) {
            const context = this;
            const doLater = function () {
                timeoutId = undefined;
                if (!options.isImmediate) {
                    func.apply(context, args);
                }
            };
            const shouldCallNow = (options.isImmediate || options.runImmediatelyFirstTimeOnly) && timeoutId === undefined;
            options.runImmediatelyFirstTimeOnly = false;
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(doLater, waitMilliseconds);
            if (shouldCallNow) {
                func.apply(context, args);
            }
        }
    }

    hf.click = function (e) {
        e.target
    }

}());

