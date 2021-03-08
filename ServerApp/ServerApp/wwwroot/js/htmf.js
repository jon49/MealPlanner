﻿(function () {

    const debounced = {}
    function debounce(func, key, option = { args: [], wait: 50, isImmediate: false, immediateFirst: false }) {
        if (!debounced[key]) {
            debounced[key] = option
        }
        const options = debounced[key]
        let timeoutId = options.timeoutId
        const context = this
        const doLater = function () {
            timeoutId = undefined
            if (!options.isImmediate) {
                func.apply(context, options.args);
            }
        };
        const shouldCallNow = (options.isImmediate || options.immediateFirst) && timeoutId === undefined;
        options.immediateFirst = false;
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        options.timeoutId = setTimeout(doLater, options.wait);
        if (shouldCallNow) {
            func.apply(context, options.args);
        }
    }

    function click(self) {
        var $form = self.form
        if (!$form) return
        ($form.querySelector("button") || $form.querySelector("[type='submit']"))?.click()
    }

    document.querySelectorAll("[hf-hidden]").forEach(x => x.style.visibility = "hidden")

    self.hf = { debounce, click }

}());
