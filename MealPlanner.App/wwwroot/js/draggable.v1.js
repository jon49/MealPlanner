(function () {

    const getTarget = target => {
        if (!(target instanceof Element)) { target = target.parentElement }
        if (target?.closest) {
            return target.hasAttribute("data-highlight-draggable")
                ? target
            : target.closest("[data-highlight-draggable]")
        }
    }

    let container = document.querySelector("[data-draggable]")

    let source = null
    container?.addEventListener('dragstart', e => {
        let target = getTarget(e.target)
        if (!target) return
        target.style.opacity = 0.4

        source = target
    }, false)

    container?.addEventListener('dragend', e => {
        let target = getTarget(e.target)
        if (!target) return
        target.style.opacity = ""
    }, false)

    document.addEventListener("dragover", e => e.preventDefault(), false);

    let current
    container?.addEventListener('dragenter', e => {
        let target = getTarget(e.target)
        current = null
        if (!target || target === source) return
        current = target
        target.style.background = '#d1a553'
    }, false)

    container?.addEventListener('dragleave', e => {
        let target = getTarget(e.target)
        if (!target) return
        if (target === current) return
        target.style.background = ""
    }, false)

    container?.addEventListener('drop', e => {
        if (e.stopPropagation) e.stopPropagation()
        e.preventDefault()
        let target = getTarget(e.target)
        if (!target) return
        if (source !== target) {
            target.style.background = ""
            let targetNext = target.nextElementSibling
            let sourceNext = source.nextElementSibling
            if (targetNext) {
                container.insertBefore(source, targetNext)
            }
            if (sourceNext) {
                container.insertBefore(target, sourceNext)
            }
            var targetId = target.id
            target.id = source.id
            source.id = targetId
            let event = new CustomEvent("swapped", { detail: {source, target} })
            document.dispatchEvent(event)
        }

        return false
    }, false)

    container?.addEventListener('click', e => {
        if (source) {
            let target = getTarget(e.target)
            if (!target) return
            e.preventDefault()
            let event = new Event("drop", { bubbles: true })
            target.dispatchEvent(event)
        }
    })

})()
