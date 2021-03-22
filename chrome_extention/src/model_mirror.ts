import moment from 'moment'
import { ModuleAction, ModuleStore, KV } from 'module-reaction'
export const GLOBAL_MODULE = 'global_module_mirror'
export const TAB_HISTROY = 'history'
export const TAB_MODELS = 'models'
export const TITLE_VIEW_GLOBAL = 'Global states:'
export interface MirrorModel extends ModuleStore {
    enabled: boolean
    actions: { old: KV, changed: KV, time: string }[]
    models: KV,
    viewModel: KV,
    activedTab: string,
    viewTitle: string
}
export const mirror_model: MirrorModel = {
    module: GLOBAL_MODULE,
    enabled: false,
    actions: [],
    models: {},
    viewModel: {},
    viewTitle: TITLE_VIEW_GLOBAL,
    activedTab: TAB_HISTROY
}

export const addAction: ModuleAction = {
    module: GLOBAL_MODULE,
    process: async ({ store: newStore, mstore, changed }, { actions }) => {
        return {
            actions: [
                ...actions,
                {
                    old: mstore,
                    changed,
                    time: moment().format('hh:mm:ss')
                }
            ],
            models: newStore,
            enabled: true
        }
    }
}

export const viewModel: ModuleAction = {
    module: GLOBAL_MODULE,
    process: async ({ m, title }) => ({
        viewModel: m,
        viewTitle: title,
        activedTab: TAB_MODELS
    })
}

export const viewGlobal: ModuleAction = {
    module: GLOBAL_MODULE,
    process: async (payload, store) => ({
        viewModel: store.models,
        viewTitle: TITLE_VIEW_GLOBAL,
        activedTab: TAB_MODELS
    })
}