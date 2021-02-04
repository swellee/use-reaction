import {ReducerParam } from "../lib/useReaction"
/**
 * it's better to define a interface for your model
 */
interface ModelA {
    a: number
    b: number,
    c: number
    d: {
        dd: number
    }
}

/**
 * declare a const to hold your model
 */
export const model_a: ModelA = {
    a: 1,
    b: 1,
    c: 1,
    d: {
        dd: 1
    },
}

/**
 * action is a function which return changed part {} of model,
 * 
 * @param param0 
 */
export const actionTestA = ({payload, store}: ReducerParam<ModelA>) => {
    console.log('do action test, get payload:', payload)

    // the next-line will cause error, b/c in action, the store's prop can't be modified directly
    // store.a = 6
    
    // return changed part
   return {
       a: store.a + payload,
       b: store.b + payload
   }
}
