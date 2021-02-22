import { justBack, ReducerParam } from "../lib/useReaction";

/**
 * define a const of model
 */
export const model_b = {
    e: 1,
    f: 1,
}

/**
 * action is a function which return changed part {} of model,
 * can be normal function or Promise-like function
 * @param param0 
 */
export async function actionTestB({ store }: ReducerParam<typeof model_b>) {
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
        e: store!.e + 5
    }
}

export async function actionJustBackData({ payload }: any) {
    return justBack('hello' + payload)
}