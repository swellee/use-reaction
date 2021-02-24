import React, { createContext, useContext, useReducer } from "react"
export interface KV { [k: string]: any }
export interface Model extends KV { }
export type Action<M> = (param: { payload?: any, store: Readonly<M> }) => void | Partial<M> | Promise<Partial<M>> | Promise<void>

const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'
const MODEL_KEY_PRE = 'USE::REACTION::MODULE::'
const MODEL_KEY_TAG = '__MODULE__'
const BACK_TAG = 'USE::REACTION::JUSTBACK::'
const global: any = {}
/** call this at the top line of your app to initialize */
export function useReaction() {
    global.loading_call = 0
    global.model_loading_call = {}
    global.ctx = createContext(null)
    global.provider = function Provider(props: KV) {
        const [store, dispatch] = useReducer((_: any, m: any) => m, { [LOADING_TAG]: false })
        return React.createElement(global.ctx.Provider, { value: { store, dispatch } }, props.children);
    }
}
/** call this to get the root Provider to wrap your app */
export function useProvider() {
    return global.provider
}
/**call this to retrive the store + action-trigger + resetModel-trigger of given model */
export function useModel<M extends Model = Model>(model: M): {
    /**the store of this model */
    store: M
    /**the function to trigger action for this model, pls Note that it won't affect other models */
    doAction: (action: Action<M>, payload?: any, showLoading?: 'model' | 'global') => Promise<Partial<M>> | Promise<void>
    /**the function to reset model to it's initial state when you defined it */
    resetModel: () => void
} {
    const { store, dispatch }: any = useContext(global.ctx)
    const m: any = model
    let modelKey = m[MODEL_KEY_TAG]
    if (!modelKey) {
        modelKey = m[MODEL_KEY_TAG] = MODEL_KEY_PRE + Math.random().toString().split('.')[1] + Date.now()
        store[modelKey] = m
    }
    const mStore = store[modelKey]
    /**
     * action trigger
     * @param action the action-like function
     * @param payload the payload which will pass to action-function
     * @param showLoading whether showloading, possible value is 'model' | 'global' | true, default=undefined, and true is same with 'global', 'model' means only change the loading flag for this model
     */
    async function doAction(action: Action<M>, payload: any = undefined, showLoading?: 'model' | 'global') {
        if (showLoading === 'global') {
            global.loading_call++
            if (!store[LOADING_TAG]) {
                dispatch({ ...store, [LOADING_TAG]: true })
            }
        } else if (showLoading === 'model') {
            global.model_loading_call[modelKey] = global.model_loading_call[modelKey] || 0
            global.model_loading_call[modelKey]++
            if (!mStore[LOADING_TAG]) {
                dispatch({ ...store, [modelKey]: { ...mStore, [LOADING_TAG]: true } })
            }
        }
        const changed = await action({ payload, store: Object.freeze({ ...mStore }) })

        if (showLoading === 'global') {
            global.loading_call--
            if (global.loading_call <= 0) {
                global.loading_call = 0
                dispatch({ ...store, [LOADING_TAG]: false })
            }
        } else if (showLoading === 'model') {
            global.model_loading_call[modelKey]--
            if (global.model_loading_call[modelKey] <= 0) {
                global.model_loading_call[modelKey] = 0
                dispatch({ ...store, [modelKey]: { ...mStore, [LOADING_TAG]: false } })
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

        // limit changed data only contains keys already exist in model
        const mStoreCopy = { ...mStore }
        for (let key in changed) {
            if (key in mStoreCopy) {
                mStoreCopy[key] = changed[key]
            }
        }
        // update model
        dispatch({ ...store, [m[MODEL_KEY_TAG]]: mStoreCopy })

        // after rerender, normally return the action's result data to UI-LEVEL 
        return changed
    }
    return {
        store: mStore,
        doAction,
        resetModel: () => doAction(() => m)
    }
}
/**get the loading state of given model, if don't provide model param, then will return the global loading state */
export function useLoading<M extends Model>(m?: M): boolean {
    const { store } = useContext(global.ctx)
    if (m) {
        return m[MODEL_KEY_TAG] ? Boolean(store[m[MODEL_KEY_TAG]][LOADING_TAG]) : false
    }
    return store[LOADING_TAG]
}
/**
 * use this in your action function to just return data without modify model, won't trigger rerender
 * @param data the data to return outter
 */
export function justBack(data: any) {
    return { [BACK_TAG]: data } as any
}