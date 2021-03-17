import { Button } from "antd"
import { List } from "rc-field-form"
import { useModel } from "use-reaction"
import { mirror_model, viewGlobal, viewModel } from "./model_mirror"

export const ActionHistory = (props) => {
    const { store: { actions }, doAction } = useModel(mirror_model)

    return <List className="action-history" >
        {
            actions.map((act, idx) => {
                const { old, changed, time } = act;
                return <List.Item key={`${idx}-${time}`}>
                    <span className="time">action-{idx} at {time}</span>
                    <Button onClick={e => doAction(viewModel, { m: old, title: 'Model data before this action:' })} className="view-old" title="view model data before action">model before</Button>
                    <Button onClick={e => doAction(viewGlobal)} className="view-changed" title="view changed data by action">data changed</Button>
                </List.Item>
            })
        }
    </List>
}