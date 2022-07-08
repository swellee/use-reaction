import React from 'react'
import { KV, useLoading, useModel, useProvider, useReaction } from "./lib/useReaction";
import { actionTestA, model_a } from './models/model_a';
import { actionJustBackData, actionTestB, model_b } from './models/model_b';
import { Button, Form, Input, Spin } from 'antd'
import Password from 'antd/lib/input/Password';
import 'antd/dist/antd.css'
import './app.css'
export const App: React.FC = () => {
    /**init use-reaction */
    useReaction(true)

    /**obtain Provider */
    const Provider = useProvider()

    /**render */
    return <Provider>
        <GlobalLoading>
            <SubPageA />
            <SubPageB>
                <CompC />
            </SubPageB>
        </GlobalLoading>
        <CompC />
    </Provider>
}

function GlobalLoading(props: KV) {
    const loading = useLoading()
    console.log('loading:', loading)
    return < Spin spinning={loading} >
        {props.children}
    </Spin >
}

//--------examples of how to use---------
function SubPageA(props?: KV) {
    const { store, doAction, doFunction } = useModel(model_a)
    const { store: storeB, doAction: doActionB } = useModel(model_b)

    const onfinish = async (values: any) => {
        console.log('values', values)
        await doAction(actionTestA, 2, 'global')
        console.log('hello hello')
    }
    return (

        <div className="page page-a">
            <h3>page A</h3>
            <div>
                value 'A' is {store.a}
            </div>
            <div>
                value 'B' is {storeB.b}
            </div>
            <Form onFinish={onfinish}>
                <Form.Item label="email" name="email"><Input /></Form.Item>
                <Form.Item label="password" name="password"><Password /></Form.Item>
                <Button htmlType="submit">increase A with global loading</Button>
            </Form>
            <button onClick={async e => {
                const backed = await doActionB(actionJustBackData, ',world:' + Date.now())
                const testFn = await doFunction(async()=>{
                    return 'testFn'
                }, 'global')
                alert(backed)
                console.log(testFn)
            }}>just back data</button>
        </div>

    )
}
function SubPageB(props: KV) {
    const { store, doAction } = useModel(model_b)
    const loading = useLoading(model_b)
    console.log('model render loading', loading)
    return (
        <Spin spinning={loading}>

            <div className="page page-b">
                <h3>page B</h3>
                <div>
                    value B is {store.b}
                </div>
                <button onClick={e => {
                    doAction(actionTestB, 'do action with loading', 'model')
                }}>Increse B with model loading</button>

                <h6>see my child compenent below:</h6>
                {props.children}
            </div>
        </Spin>

    )
}

function CompC() {
    const { store, resetModel, doAction } = useModel(model_a)
    const { store: storeB, resetModel: resetModelB } = useModel(model_b)
    return <div className="comp">
        <p>the values in model_a:</p>
        <ul>
            <li><span>Value A:</span><span>{store.a}</span></li>
            <li><span>Value AA:</span><span>{store.aa.aa}</span></li>
        </ul>
        <button onClick={resetModel}>reset model_a</button>
        <hr />
        <p>the values in model_b:</p>
        <ul>
            <li><span>Value B:</span><span>{storeB.b}</span></li>
        </ul>
        <hr />
        <button onClick={resetModelB}>reset model_b</button>
        <button onClick={e => doAction(actionTestA, null, 'global')}> do loading</button>
    </div>
}