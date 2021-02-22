import React, { createContext, useContext, useReducer } from "react"
export interface KV { [k: string]: any }
export interface Model extends KV { }

export type ReducerParam<M = Model> = { payload?: any, store: Readonly<M> }
type Reducer<M> = (param: ReducerParam<M>) => void | Partial<M> | Promise<Partial<M>> | Promise<void>

const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'
const MODEL_KEY_PRE = 'USE::REACTION::MODULE::'
const MODEL_KEY_TAG = '__MODULE__'
const BACK_TAG = 'USE::REACTION::JUSTBACK::'
const global: any = {}

export function useReaction() {
    global.loading_call = 0
    global.ctx = createContext(null)
    global.provider = function Provider(props: KV) {
        const [store, dispatch] = useReducer((_: any, m: any) => m, { [LOADING_TAG]: false })

        return React.createElement(global.ctx.Provider, {
            value: { store, dispatch }
        }, props.children);
    }
}
export function useProvider() {
    return global.provider
}

export function useModel<M extends Model = Model>(model: M): {
    store: M
    dispatch: (reducer: Reducer<M>, payload?: any) => (payload?: any, showLoading?: boolean) => Promise<Partial<M>> | Promise<void> 
} {
    const { store, dispatch }: any = useContext(global.ctx)
    const m: any = model
    let modelKey = m[MODEL_KEY_TAG]
    if (!modelKey) {
        modelKey = m[MODEL_KEY_TAG] = MODEL_KEY_PRE + Math.random().toString().split('.')[1] + Date.now()
        store[modelKey] = m
    }
    const mStore = store[modelKey]
    return {
        store: mStore,
        dispatch: function (action: Reducer<M>) {
            return async function (payload?: any, showLoading?: boolean) {
                if (showLoading) {
                    global.loading_call++
                    console.log('loading', store)
                    if (!store[LOADING_TAG]) {
                        console.log('start loading')
                        dispatch({
                            ...store,
                            [LOADING_TAG]: true
                        })
                    }
                }
                const mStoreCopy = { ...mStore }
                Object.freeze(mStoreCopy)
                const changed = await action({ store: mStoreCopy, payload })

                if (showLoading) {
                    global.loading_call--
                    if (global.loading_call <= 0) {
                        global.loading_call = 0
                        console.log('loading', store)

                        dispatch({
                            ...store,
                            [LOADING_TAG]: false
                        })
                    }
                }

                if (!changed) {
                    // action finish without return data, so won't trigger rerender
                    return
                }

                if (changed[BACK_TAG]) {
                    // coder just want to return the data to thier UI-LEVEL, so won't trigger rerender
                    return changed[BACK_TAG] as any
                }
                // update model
                dispatch({
                    ...store,
                    [m[MODEL_KEY_TAG]]: {
                        ...mStore,
                        ...changed
                    }
                })

                // after rerender, normally return the action's result data to UI-LEVEL 
                return changed
            }
        }
    }
}

export function useLoading() {
    const { store } = useContext(global.ctx)
    return store[LOADING_TAG]
}

export function justBack(data: any) {
    return { [BACK_TAG]: data } as any
}