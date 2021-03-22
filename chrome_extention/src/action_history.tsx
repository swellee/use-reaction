import React from 'react'
import { Button } from "antd"
import { mapProp } from "module-reaction"
import { List } from "antd"
import { MirrorModel, mirror_model, viewGlobal, viewModel } from "./model_mirror"
import { doAction, KV } from 'module-reaction'

@mapProp(mirror_model)
export class ActionHistory extends React.Component<Partial<MirrorModel>, KV> {
    render() {
        const { actions } = this.props

        return <List className="action-history" >
            {
                actions!.map((act, idx) => {
                    const { old, changed, time } = act;
                    return <List.Item key={`${idx}-${time}`}>
                        <span className="time">action-{idx} at {time}</span>
                        <Button onClick={e => doAction(viewModel, { m: old, title: 'Model data before this action:' })} className="view-old" title="view model data before action">model before</Button>
                        <Button onClick={e => doAction(viewModel, { m: changed, title: 'changed data by this action:' })} className="view-changed" title="view changed data by action">data changed</Button>
                    </List.Item>
                })
            }
        </List>
    }
}