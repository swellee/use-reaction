import moment from 'moment'
export const mirror_model = {
    enabled: false,
    actions: [{old: {a:1}, changed: {a: 2}, time: '12:00:00'}],
    models: {},
    viewModel: {},
    viewTitle: ''
}

export const toggleEnable = () => {
    return { enabled: true }
}

export const addAction = ({ store: { actions }, payload: { store: newStore, mstore, changed } }) => {
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

export const upModels = ({ payload }) => ({ enabled: true, models: payload })

export const viewModel = ({ payload: { m, title } }) => ({
    viewModel: m,
    viewTitle: title
})

export const viewGlobal = ({ store }) => ({
    viewModel: store.models,
    viewTitle: 'Global states:'
})