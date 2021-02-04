import React from 'react'
import { KV, useModel, useProvider, useReaction } from "./lib/useReaction";
import { actionTestA, model_a } from './models/model_a';
import { actionTestB, model_b } from './models/model_b';

export const App: React.FC = () => {
    /**init use-reaction */
    useReaction()

    /**obtain Provider */
    const Provider = useProvider()

    /**render */
    return <Provider>
        <SubPageA />
        <SubPageB>
            <CompC />
        </SubPageB>
    </Provider>
}

//--------examples of how to use---------
function SubPageA(props?: KV) {
    const { store, dispatch } = useModel(model_a)
    const actionIncreseMulti = dispatch(actionTestA)

    return (
        <div className="page page-a">
            <h3>page A</h3>
            <div>
                model_a.a's value is {store.a}
            </div>
            <button onClick={e => {
                /**
                * store's first-level prop is interactive,
                * so you can modify it directly
                */
                store.a++
            }}>Increse a's value</button>
            <button onClick={e => actionIncreseMulti(2)}>Increse a & b by action</button>
        </div>
    )
}
function SubPageB(props: KV) {
    const { store, dispatch } = useModel(model_b)
    const actionB = dispatch(actionTestB)
    return (
        <div className="page page-b">
            <h3>page B</h3>
            <div>
                model_b.e's value is {store.e}
            </div>
            <button onClick={actionB}>Increse e by delayed action</button>
            <h6>see my child compenent below:</h6>
            {props.children}
        </div>
    )
}

function CompC() {
    const { store, dispatch } = useModel(model_a)
    const { store: storeB, dispatch: dispatchB } = useModel(model_b)

    return <div className="comp">
        <p>the values in model_a:</p>
        <ul>
            <li><span>a:</span><span>{store.a}</span></li>
            <li><span>b:</span><span>{store.b}</span></li>
            <li><span>c:</span><span>{store.c}</span></li>
        </ul>
        <button onClick={
            /**
             * when call useModel, the const model was just used to clearify model's structur, so, it's origin values were never modified.
             * so, here, we can use a function which simply return the original const model to reset the state!
             */
            dispatch(() => model_a)
        }>reset model_a</button>
        <hr />
        <p>the values in model_b:</p>
        <ul>
            <li><span>e:</span><span>{storeB.e}</span></li>
            <li><span>f:</span><span>{storeB.f}</span></li>
        </ul>
        <hr />
        <button onClick={
            /**
             * when call useModel, the const model was just used to clearify model's structur, so, it's origin values were never modified.
             * so, here, we can use a function which simply return the original const model to reset the state!
             */
            dispatchB(() => model_b)
        }>reset model_b</button>
    </div>
}