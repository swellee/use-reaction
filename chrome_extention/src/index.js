import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
let chrome = window.chrome

const panel_port = chrome.runtime.connect({
  name: 'use-reaction-devpanel'
})
panel_port.postMessage({ to: 'use-reaction-devtools', info: 'hello, i am devpanel' })
panel_port.onMessage.addListener(function (msg) {
  console.log('hook got msg:', msg)
  // let data = { name: msg }
  document.querySelector('#app').innerHTML = JSON.stringify(msg.changed)

})

let node = document.querySelector('#test')
node && node.addEventListener('click', toDetector)

function toDetector() {
  panel_port.postMessage({ to: 'use-reaction-detector', info: 'msg from devpanel' })
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes['useReactionEnabled']) {
     
  }
})

import './App.css';

function App() {
  return (
    <div className="App">
      
    </div>
  );
}

export default App;


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
