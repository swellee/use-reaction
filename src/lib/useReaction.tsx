import React, { createContext, useContext, useReducer } from "react"
export interface KV { [k: string]: any }
export interface Model extends KV { NAME?: string }
export type Action<M = Model> = (param: { payload?: any, store: Readonly<M> }) => void | Partial<M> | Promise<Partial<M>> | Promise<void>
const GLOBAL_KEY = 'USE::REACTION::GLOBAL::KEY'
const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'
const MODEL_KEY_PRE = 'USE::REACTION::MODULE::'
const MODEL_KEY_TAG = '__MODULE__'
const BACK_TAG = 'USE::REACTION::JUSTBACK::'
const global: any = { init: { [LOADING_TAG]: {loading: false} } }
const queue: { action: Action<any>, modelKey: string, payload?: any, callback?: (res?: any) => void, isloading?: boolean }[] = []
/** call this at the top line of your app to initialize, provide a 'true' param if you want to enable devtool, Note: it's better not enable devtool for your production mode */
export function useReaction(enableDev?: boolean, strict?: boolean) {
    if(global.ctx)return;
    global.strict = strict
    global.ctx = global.ctx || createContext(null)
    enableDev && document && window.postMessage({ __USE_REACTION_DEV_ENABLED__: true }, '*')
    global.provider = function Provider(props: KV) {
        const [store, dispatch] = useReducer((_: any, m: any) => m, global.init)
        Object.assign(global, { store, dispatch })
        return React.createElement(global.ctx.Provider, { value: { store } }, props.children);
    }
}
/** call this to get the root Provider to wrap your app */
export const useProvider = () => global.provider
function inQueue<M extends Model>(action: Action<M>, payload: any, modelKey: string, loading?: 'model' | 'global', loadingTip?: string): Promise<any> {
    return new Promise<any>(_ => {
        let readyNum = 1
        if (loading) {
            readyNum = 3
            queue.push({ action: () => ({ [LOADING_TAG]: {loading: true, tip:loadingTip} }), modelKey: loading === 'global' ? GLOBAL_KEY : modelKey, isloading: true })
        }
        queue.push({ action, modelKey, payload, callback: _ })
        if (loading) {
            queue.push({ action: () => ({ [LOADING_TAG]: {loading:false} }), modelKey: loading === 'global' ? GLOBAL_KEY : modelKey, isloading: true })
        }
        queue.length === readyNum && nextAction()
    })
}
async function nextAction() {
    if (!queue.length) return
    const { action, modelKey, payload, callback, isloading } = queue.shift()!
    const { store, dispatch } = global
    const mStore = modelKey === GLOBAL_KEY ? store : store[modelKey]
    const mStoreOld = Object.freeze({ ...mStore })
    let changed
    try { changed = await action({ payload, store: mStoreOld }) } catch (error) { console.warn('action failed by:', error, 'skipped') }
    if (!changed || !Object.keys(changed).length) {
        callback && callback()
    } else if (changed[BACK_TAG]) {
        callback && callback(changed[BACK_TAG])
    } else {
        // limit changed data only contains keys already exist in model for strict mode
        for (let key in changed) {
            if (!global.strict || key === LOADING_TAG || key in mStore) {
                mStore[key] = changed[key]
            }
        }
        // update model
        dispatch({ ...global.store }); // note: global.store is differnt from storeNew, can't dispatch global.store directly
        !isloading && (window as any)['__USE_REACTION_DEV_EXTENTION__'] && (window as any)['__USE_REACTION_DEV_EXTENTION__'](global.store, mStoreOld, changed)
        callback && callback(changed)
    }
    nextAction()
}
/**call this to retrive the store + action-trigger + resetModel-trigger of given model */
export function useModel<M extends Model = Model>(model: M): {
    /**the store of this model */
    store: M
     /**
     * action trigger
     * @param action the action-like function
     * @param payload the payload which will pass to action-function
     * @param showLoading whether showloading, possible value is 'model' | 'global' . default=undefined, 'global' means show global loading; and 'model' means only change the loading flag for this model
     */
    doAction: (action: Action<M>, payload?: any, showLoading?: 'model' | 'global', loadingTip?: string) => Promise<Partial<M>> | Promise<void>,
    /** a convenient trigger to execute freedom function in action queue, and optional trigger loading, but won't affect model data */
    doFunction: (fn: Function, showLoading?: 'model' | 'global', loadingTip?: string)=> any,
    /**the function to reset model to it's initial state when you defined it */
    resetModel: () => void
} {
    const { store }: any = useContext(global.ctx) || global
    const m: any = model
    let modelKey = m[MODEL_KEY_TAG]
    if (!modelKey) {
        modelKey = m[MODEL_KEY_TAG] = MODEL_KEY_PRE + (m.NAME || (Math.random().toString().split('.')[1] + Date.now()))
        store[modelKey] = { ...m };
        (window as any)['__USE_REACTION_DEV_EXTENTION__'] && (window as any)['__USE_REACTION_DEV_EXTENTION__'](store)
    }
    const doAction = (action: Action<M>, payload: any = undefined, showLoading?: 'model' | 'global', loadingTip?: string) => inQueue(action, payload, modelKey, showLoading, loadingTip)
    const doFunction = (fn: Function, showLoading?: 'model' | 'global', loadingTip?: string)=> doAction(async ()=>justBack(await fn()), null, showLoading, loadingTip) 
    return { store: store[modelKey], doAction, doFunction, resetModel: () => doAction(() => m) }
}
export function useLoadingTip<M extends Model>(m?: M): { loading: boolean, tip?: string } {
    const { store } = useContext(global.ctx) || global
    return m && m[MODEL_KEY_TAG] ? store[m[MODEL_KEY_TAG]][LOADING_TAG] : store[LOADING_TAG]
}
/**get the loading state of given model, if don't provide model param, then will return the global loading state */
export const useLoading= <M extends Model>(m?: M)=> Boolean(useLoadingTip(m)?.loading);
/**
 * NOT recommended to use, you'd better trigger loading by call doAction or doFunction
 * This function might be usefull where need to mark global loading in non-UI section, eg. within fetch or axios call
 * @param loading boolean
 * @param tip loading tip, you can use this text to display the processing hint
 * @param m set the loading(true/false) of specific model, if not provide, then set global loading
 */
export function setLoading(loading: boolean, tip?: string, m?: Model){
    const { store, dispatch } = global;
    const modelKey = m?.[MODEL_KEY_TAG]; 
    const model = !!modelKey? store[m[MODEL_KEY_TAG]] : store;
    dispatch({...store, ...(modelKey? {[modelKey]: {...model, [LOADING_TAG]:{loading, tip} }} : {[LOADING_TAG]: {loading, tip}})});
}
/**
 * use this in your action function to just return data without modify model, won't trigger rerender
 * @param data the data to return outter
 */
export const justBack = (data: any) => ({ [BACK_TAG]: data } as any)