import { compile } from "stage0";
function getTemplate(id) {
    var _a, _b;
    var node = (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.firstChild;
    if (!node) {
        throw "Template \"" + id + "\" is not found.";
    }
    compile(node);
    return node;
}
export default {
    get: getTemplate
};
