import React from 'react'
import { Button } from "antd"
import { mapProp } from "module-reaction"
import { List } from "antd"
import { GLOBAL_MODULE, MirrorModel, mirror_model, viewGlobal, viewModel } from "./model_mirror"
import { doAction, KV } from 'module-reaction'

@mapProp(mirror_model)
export class ActionHistory extends React.Component<Partial<MirrorModel>, KV> {
    render() {
        const { actions } = this.props

        return <div className="list-con">
            <List className="action-history" >
                {
                    actions!.map((act, idx) => {
                        const { old, changed, time } = act;
                        return <List.Item key={`${idx}-${time}`} className="action-item">
                            <span className="time">action-{idx} at {time}</span>
                            <Button type="dashed" onClick={e => doAction(viewModel, { m: old, title: 'Model data before this action:' })} className="view-old" title="view model data before action">Model before</Button>
                            <Button type="primary" onClick={e => doAction(viewModel, { m: changed, title: 'changed data by this action:' })} className="view-changed" title="view changed data by action">Data changed</Button>
                        </List.Item>
                    })
                }
            </List>
            <div className="view-global">
                <h2>Tips:</h2>
                <div className="tips">
                    1. on the left, you can see the action history list.
                </div>
                <div className="tips">
                    2. for each action, you can view the model-data snapshot before this action. as well as the changed-part by this action.
                </div>
                <div className="tips">
                    or, you can view the current sanpshot of global-models by click button below:
                </div>
                <Button type="dashed" className="view-global-btn" onClick={e => doAction(viewGlobal)}>View Global Models</Button>
                <br />
                <br />
                <br />
                <Button type="dashed" className="clear-btn" onClick={e => doAction(GLOBAL_MODULE, { actions: [], viewModel: {} })}>Clear action history</Button>
            </div>
        </div>
    }
}