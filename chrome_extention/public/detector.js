let detector_port
function onMsg(msg) {
    // in the future, may implement functions to execute cmd from devtool
    console.log('got msg from devtool:', msg)
}
function connectToBg() {
    detector_port = chrome.runtime.connect({
        name: 'use-reaction-detector'
    })

    detector_port.postMessage({ to: 'use-reaction-devtools', info: 'hello, i am detector' })
    detector_port.onMessage.addListener(onMsg)
    // auto reconnect
    detector_port.onDisconnect.addListener(function () {
        detector_port && detector_port.removeListener(onMsg)
        detector_port = null
        setTimeout(connectToBg, 500);
    })
}

connectToBg()

window.addEventListener('message', e => {
    if (e.source === window && e.data.__USE_REACTION_DEV_ENABLED__) {
        installScript(devFn)
        detector_port.postMessage({ enableDev: true, to: 'use-reaction-devpanel' })
    } else if (e.data) {
        detector_port.postMessage({...e.data, to: 'use-reaction-devpanel'})
    }
})

function devFn(win) {
    const MODEL_KEY_PRE = 'USE::REACTION::MODULE::'
    const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'

    function getDevStore(store) {
        return Object.keys(store).reduce((st, key) => {
            if (key.startsWith(MODEL_KEY_PRE) || key.startsWith(LOADING_TAG)) {
                st[key] = store[key]
            }
            return st
        }, {})
    }
    win.__USE_REACTION_DEV_EXTENTION__ = (store, mstore, changed) => {
        win.postMessage({ store: getDevStore(store), mstore, changed})
    }
}

function installScript(fn) {
    const source = ';(' + fn.toString() + ')(window)'

    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
}