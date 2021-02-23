import { Action, justBack } from "../lib/useReaction";

/**
 * define a const of model
 */
export const model_b = {
    b: 1
}

/**
 * action is a function which return changed part {} of model,
 * can be normal function or Promise-like function
 * @param param0 
 */
export const actionTestB: Action<typeof model_b> = async function ({ store }) {
    console.log('do action test for B')

    console.log('doing sth may cost time...')
    await new Promise(resolve => {
        setTimeout(() => {
            console.log('done.')
            resolve('')
        }, 2000);
    })

    // return the changed part
    return {
        b: store.b + 5,
    }
}

export const actionJustBackData: Action<typeof model_b> = async function({ payload }) {
    return justBack('hello' + payload)
}