import React, { useReducer } from "react"
export interface KV {
    [k: string]: any
}
export interface Model extends KV {
}

type ModelStates<M extends Model> = {
    [k: string]: M
}
type Global<M> = {
    ctx: React.Context<any>
    provider?: any
    models: ModelStates<M>
    upModel: React.Dispatch<React.SetStateAction<ModelStates<M>>>
}

export type ReducerParam<M = Model> = { payload?: any, store: Readonly<M> }
type Reducer<M> = (param: ReducerParam<M>) => Partial<M> | Promise<Partial<M>>

const global: Global<Model> = {
    ctx: undefined as any,
    provider: undefined as any,
    models: undefined as any,
    upModel: undefined as any
}

function uuid(): string {
    const arr = []
    const src = (Math.random().toString().split('.')[1] + Math.random().toString().split('.')[1]).substr(0, 24)
    while (arr.length < 4) {
        arr.push(src.substr(arr.length * 6, 6))
    }
    return arr.sort((a, b) => Math.random() > 0 ? 1 : -1).join('-')
}

function getModelReducer<M extends Model>(modelkey: string) {
    function useFn(reducer: Reducer<M>) {

        const gStore = global.models
        let mdStore = gStore[modelkey] as M
        const mdStoreCopy = { ...mdStore }
        // not allow modify directly in reducer function
        Object.freeze(mdStoreCopy)

        return async function (payload: any) {
            let changedPart = await reducer({ payload, store: mdStoreCopy })

            // limit reducer only modify the target model's exist keys
            for (let key in changedPart) {
                if (!(key in mdStore)) {
                    delete changedPart[key]
                }
            }

            global.upModel({ ...mdStore, ...changedPart })
        }
    }

    return useFn
}

function wrapProxy<M extends Model>(m: M): M {
    return new Proxy(m, {
        get: function (target, key, receiver) {
            return Reflect.get(target, key, receiver)
        },
        set: function (target, key, value, receiver) {
            if (target[key as string] !== undefined) {
                // modify exist value
                Reflect.set(target, key, value, receiver)
                target.__module__ && global.upModel(target)
            }
            return true
        }
    })
}

/**
 *@summary First of all, call this at the top-line of your App function to initialize
 */
export function useReaction() {
    global.ctx = React.createContext(null)

    const [models, upModel] = useReducer((_: any, m: any) => ({ ...global.models, [m.__module__]: wrapProxy(m) }), {})
    Object.assign(global, { models, upModel })

    global.provider = (props: KV) => React.createElement(global.ctx.Provider, { ...props, value: global.models }, props.children)
}

/**
 *@summary Second, call this to get the root Provider to wrap your App node,
 * note that: embed one Provider into another is allowed, but won't get extra ability
 * b/c they're using the same global store
 */
export function useProvider(): React.FC {
    return global.provider
}

/**
 *@summary Third: useModel in non-root Node.
 * Require: define the model as a const first, eg: const model_a = {xx:xx,..}.
 * then, in some non-root React.FC, call useModel(model_a) to obtain the store and dispatch of the given model
 * @param m model instance, just used to initial the structure of this model,
 * the model will be wrapped by proxy, so you can modify its first-level props directly like: model_a.sth = xxx
 */
export function useModel<M extends Model = Model>(m: M): {
    store: M
    dispatch: (reducer: Reducer<M>, payload?: any) => (payload?: any) => Promise<void>
} {
    const gStore = global.models

    if (!m.__module__) {
        (m as any).__module__ = 'REACTION::MODEL::' + uuid()
        gStore[m.__module__] = wrapProxy(m)
    }

    return {
        store: gStore[m.__module__] as M,
        dispatch: getModelReducer(m.__module__)
    }
}