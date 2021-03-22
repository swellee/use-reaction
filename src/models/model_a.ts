import { Action } from "../lib/useReaction"

/**
 * it's better to define a interface for your model
 */
interface ModelA {
    a: number
    aa: {
        aa: number
    },
    hello: {
        world: {
            welcome: string
        }
    }
}

/**
 * declare a const to hold your model
 */
export const model_a: ModelA = {
    a: 1,
    aa: {
        aa: 1
    },
    hello: {
        world: {
            welcome: 'to use-reaction'
        }
    }
}

/**
 * action is a function which return changed part {} of model,
 * 
 * @param param0 
 */
export const actionTestA: Action<ModelA> = async ({ payload, store }) => {
    console.log('do action test, get payload:', payload)

    // the next-line will cause error, b/c in action, the store's prop can't be modified directly
    // store.a = 6

    console.log('doing sth may cost time...')
    await new Promise(resolve => {
        setTimeout(() => {
            console.log('done.')
            resolve('')
        }, 2000);
    })
    // return changed part
    return {
        a: store.a + payload,
        aa: {aa: store.aa.aa + payload},
        sth: 'hello world' // Note: this field will be ignored and won't be added into model_a b/c the field 'sth' is not defined in ModelA !!!
    }
}
