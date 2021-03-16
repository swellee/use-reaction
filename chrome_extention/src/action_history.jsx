import { useModel } from "use-reaction"
import { mirror_model } from "./model_mirror"

export const ActionHistory = () => {
    const {store: {actions}} = useModel(mirror_model)
    
    return <div className="action-history">
        {
            actions.map(act => {

            })
        }
    </div>
}