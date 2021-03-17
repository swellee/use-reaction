import React from 'react';
import ReactDOM from 'react-dom';
import { useReaction, useProvider, useModel } from 'use-reaction'
import 'antd/dist/antd.css'
import './index.css';
import { ActionHistory } from './action_history';
import { addAction, mirror_model, toggleEnable, upModels } from './model_mirror';
import { ModelTree } from './model_tree';

let chrome = window.chrome

const triggers = {
  toggleEnable: undefined,
  pushAction: undefined,
  updateModels: undefined
}

const panel_port = chrome.runtime.connect({
  name: 'use-reaction-devpanel'
})
panel_port.onMessage.addListener(function (msg) {
  console.log('hook got msg:', msg)
  if (msg.from === 'use-reaction-detector') {
    if (msg.enableDev) {
      triggers.toggleEnable && triggers.toggleEnable()
      return
    }
    // msg from inspected window's use-reaction
    if (msg.changed) {
      // msg is an action
      triggers.pushAction && triggers.pushAction(msg)
    } else if (msg.store) {
      // update models when inspected window call useModel
      triggers.updateModels && triggers.updateModels(msg.store)
    }
  }
})

function toDevTool(msg) {
  panel_port.postMessage({ to: 'use-reaction-devtools', info: msg })
}
function toDetector(msg) {
  panel_port.postMessage({ to: 'use-reaction-detector', info: msg })
}

function App() {
  useReaction()
  const Provider = useProvider()
  return (
    <Provider>
      <Wrapper />
    </Provider>
  );
}

function Wrapper(props) {
  const { store, doAction } = useModel(mirror_model)
  triggers.toggleEnable = () => doAction(toggleEnable)
  triggers.updateModels = (m) => doAction(upModels, m)
  triggers.pushAction = (m) => {
    console.log('add action', m)
    doAction(addAction, m)
  }

  return <>
    {
      store.enabled ? (<div className="app">
        <h2 className="title">use-reaction devtool</h2>
        <div className="description">here you can view the action history and the global store's current model datas</div>
        <div className="panel">
          <ActionHistory />
          <ModelTree />
        </div>
      </div>) : (<div className="disabled">
        <div className="title">use-reaction not detected</div>
        <div className="description">
          ensure that you have included the <a href="https://www.npmjs.com/package/use-reaction">use-reaction</a> package
          into your React app, and passed 'true' when initializa call <code>useReaction(true)</code> to enabled devtool
        </div>
      </div>)
    }
  </>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
