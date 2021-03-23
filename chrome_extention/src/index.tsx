import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css'
import './index.scss';
import { ActionHistory } from './action_history';
import { addAction, GLOBAL_MODULE, mirror_model, TAB_HISTROY, TAB_MODELS, viewGlobal } from './model_mirror';
import { doAction, mapProp, Provider, KV } from 'module-reaction'
import { ModelTree } from './model_tree';
import { Tabs } from 'antd';

let chrome = (window as any).chrome

const triggers = {
  toggleEnable: () => {
    doAction(GLOBAL_MODULE, { enabled: true, actions: [], models: {} })
  },
  pushAction: (data: any) => {
    doAction(addAction, data)
  },
  updateModels: (data: any) => {
    doAction(GLOBAL_MODULE, {
      models: data
    })
  }
}

const panel_port = chrome.runtime.connect({
  name: 'use-reaction-devpanel'
})
panel_port.onMessage.addListener(function (msg: any) {
  // console.log('hook got msg:', msg)
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

function toDevTool(msg: any) {
  panel_port.postMessage({ to: 'use-reaction-devtools', info: msg })
}
function toDetector(msg: any) {
  panel_port.postMessage({ to: 'use-reaction-detector', info: msg })
}

function App() {
  return (
    <Provider>
      <Wrapper />
    </Provider>
  );
}

@mapProp(mirror_model)
class Wrapper extends React.Component<KV, KV> {
  render() {
    const { enabled, activedTab } = this.props

    return <>
      {
        enabled ? (<div className="app">
          <h2 className="title">use-reaction devtool</h2>
          <div className="des">here you can view the action history and the global store's current model datas</div>
          <Tabs className="main-tabs" activeKey={activedTab} onChange={key => {
            if (key === TAB_MODELS) {
              doAction(viewGlobal)
            } else {
              doAction(GLOBAL_MODULE, { activedTab: key })
            }
          }}>
            <Tabs.TabPane key={TAB_HISTROY} tab="Action history">
              <ActionHistory />
            </Tabs.TabPane>
            <Tabs.TabPane key={TAB_MODELS} tab="Model view">
              <ModelTree />
            </Tabs.TabPane>
          </Tabs>
        </div>) : (<div className="disabled">
          <div className="title">use-reaction not detected</div>
          <div className="des">
            <div className="tips">
            1. ensure that you have included the <a href="https://www.npmjs.com/package/use-reaction">use-reaction</a> package
          into your React app, and passed 'true' when initializa call <code>useReaction(true)</code> to enabled devtool
            </div>
            <div className="tips">
              2.refresh your webapp page; or trigger one <code>doAction</code> call, so that devtools can inspect.
            </div>
        </div>
        </div>)
      }
    </>
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
