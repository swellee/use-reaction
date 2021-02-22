import React from 'react'
import { KV, useLoading, useModel, useProvider, useReaction } from "./lib/useReaction";
import { actionTestA, model_a } from './models/model_a';
import { actionJustBackData, actionTestB, model_b } from './models/model_b';
import {Button, Form, Input, Spin} from 'antd'
import Password from 'antd/lib/input/Password';
import 'antd/dist/antd.css'
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
    const loading = useLoading()
    const { store, dispatch } = useModel(model_a)
    const {dispatch: dispatchB} = useModel(model_b)

    const actionIncreseMulti = dispatch(actionTestA)
    const testJustback = dispatchB(actionJustBackData)

    const onfinish = (values: any) => {
        console.log('values', values)
        actionIncreseMulti(2)
    }
    return (
        <Spin spinning={loading}>

        <div className="page page-a">
            <h3>page A</h3>
            <div>
                model_a value is {store.a}
            </div>
            <Form onFinish={onfinish}>
                <Form.Item label="email" name="email"><Input /></Form.Item>
                <Form.Item label="password" name="password"><Password /></Form.Item>
                <Button htmlType="submit">increase A by action</Button>
            </Form>
            <button onClick={e => {
                /**
                * store's first-level prop is interactive,
                * so you can modify it directly
                */
                store.a++
            }}>Increse a</button>
            <button onClick={ async e => {
               const backed = await testJustback(',world:' + Date.now())
               alert(backed)
            }}>action just back data</button>
        </div>
        </Spin>

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
            <button onClick={e => {
                actionB('do action with loading', true)
            }}>Increse b-e with loading</button>
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