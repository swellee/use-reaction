// /**
//  * Inject a globally evaluated script, in the same context with the actual
//  * user app.
//  *
//  * @param {String} scriptName
//  * @param {Function} cb
//  */

function injectScript(scriptName, cb) {
    const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${chrome.runtime.getUrl(scriptName)}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `
    chrome.devtools.inspectedWindow.eval(src, function (res, err) {
        if (err) {
            console.log(err)
        }
        cb()
    })
}

const port  = chrome.runtime.connect({
    name: 'use-reaction-devtools'
})

port.onMessage.addListener(function (msg) {
    console.log('devtools got msg:', msg)
})

chrome.devtools.panels.create('UseReaction', 'ur.png', 'index.html', function (panel) {
    console.log('init devtool')
    // panel.onShown.addListener(onPanelShown)
    // panel.onHidden.addListener(onPanelHidden)
})

function onPanelShown() {
    port.postMessage({ to: 'use-reaction-detector', info: 'use-reaction-devtool-shown'})
}
function onPanelHidden() {
    port.postMessage({ to: 'use-reaction-detector', info: 'use-reaction-devtool-hidden'})
}