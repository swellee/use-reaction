const ports = {}
chrome.runtime.onConnect.addListener(function (port) {
    ports[port.name] = port

    port.onMessage.addListener(function (msg) {
        if (msg.to && msg.to !== port.name) {
            ports[msg.to] && ports[msg.to].postMessage({ ...msg, from: msg.from || port.name })
        }
    });
});
