# use-reaction
react modulized store manager framework based on react hooks.
easy to manage your app's states in modulized way.
# main features
- Pure React `just react hooks` 
- Small Size `100 lines code`
- Small Api `easy to learn`
- modulized `devide your states to business units so easy to manage and keep it safe from one another`
- chrome-dev-tool `use chrome dev tool to view your module store and action history(in dev mode)`
# repo
here is [Repo](https://github.com/swellee/use-reaction), If you like this framework, consider give me a star!
# chrome-dev-tools
the chrome extention devtool has been released, [download!](https://raw.githubusercontent.com/swellee/use-reaction/main/chrome_extention/build.crx)
## use devtool to track the actions and models sanpshot.
# install
```shell
npm i use-reaction
```
# core concept:
- init:
    - call `useReaction` to init the framework
    - call `useProvider` to retrieve the root Wrapper
- develop:
    - define model instance to present module store's properties for your business.
    - call `useModel` in your UI components to get the module store data.
    - call `doAction` to change parts of your module store. once action done. will trigger re-render of UI above

# apis
1. `useReaction` - the initial function of this framework, accept two optional params, 
    - first param is **enableDev**,you can enableDevtool on development mode, so that you can use chrome-dev-tool to view the module-stores and action history (not recommend to enable dev on production mode)
    - secod param is **strict**, you can enable strict mode if you want to limit the action's back data only modify model-store's exists properties.
    -----
2. `useProvider` - return the Provider used to wrap your app's root component
    - -----
3. `useModel` - retrive the {***store***, ***doAction***, ***resetModel***} of given model instance
   1. `store` - the store of this model
   2. `doAction` - the action trigger, accept 3 params, these are:
      - ***action*** - the function (normal or PromiseLike), which can return changed part of model's Interface, or return nothing, or return `justBack(data)` to avoid modify store
      - ***payload*** - the paload which will pass to the ***action*** function,
      - ***showLoading*** - whether showloading when process this action, you can pass param ***model*** or ***global*** and, `model` means change loading state for this model-store, `global` means change loading for global, default undefined, see `useLoading`
      - Note: the doAction is an async function, and will return what the ***action*** function's return-data, so you can get the result-data of the ***action*** function
      - Note: each doAction call will be serialized into queue, so, if your can ***doAction*** multi-times, it will finish one by one!!
      - Note: if error occur during this action. framework will print error message to console, and ignore this action, then try to excute next action in the queue.
   3. `resetModel` - the trigger for reset the given model to its initial state when it's defined
   ----
4. `useLoading` - retrieve the loading flag(true/false) of given model-instance, if not provide model, then it will return the global loading flag, this flag will change when call `doAction(someAction, payload, 'model' | 'global')`
    - ----
5. `justBack` - sometimes, your action don't want to modify the model store, just want to process sth and return the data back to UI level, then you can use this api to wrap your return data, so that the return data of your action won't trigger modify and won't trigger rerender, like this:
    ```typescript
    export const actionJustBackData: Action<typeof model_b> = async function({ payload }) {
        ... do process task ...
       return justBack('hello' + payload)
   }
    ```
    ----

# How to use
1. call **useReaction()** at the top line of your App Component function to init, like this;

    ```typescript
    export const App: React.FC = () => {
        /**init use-reaction */
        useReaction()
        ...
    ```
2. call **useProvider()** to obtain the root wrapper of your app, like this:

    ```typescript
    export const App: React.FC = () => {
            /**init use-reaction */
            useReaction()

            /**obtain Provider */
            const Provider = useProvider()

            /**render */
            return <Provider>
                      <GlobalLoading>
                         ...ChildNodes
                      </GlobalLoading>
                    </Provider>
        }
    ```
3. define your models as constants, models are sth of key-value object,
    like this:
    ```typescript
       export const model_a: ModelA = {
          NAME: 'model_a', // optional, but it's better have a 'NAME' prop, then devtool can display a better way.
          a: 1,
          aa: {
              aa: 1
          },
      }
    ```
    also, you need to define your action( a function to process sth and return the changed data), 
    like this:
    ```typescript
    export const actionTestA: Action<ModelA> = ({ payload, store }) => {
          // the next-line will cause error, b/c in action, the store's prop can't be modified directly
          // store.a = 6

          // return changed part
          return {
              a: store.a + payload,
              sth: 'hello world' // Note: if you enabled strict mode, this field will be ignored and won't be added into model_a b/c property 'sth' is not defined in model_a instance !!!
          }
      }
    ```
    Note: return empty object `{}` in your action equals to return nothing, won't trigger re-render.
4. call **useModel(model_a)** in your non-root Component to get certain model's store and action-dispatcher, here is the full featured example:
    ```typescript
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
        const { store, doAction } = useModel(model_a)
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
                    alert(backed)
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
    ```
    
# more details, see the [example](https://github.com/swellee/use-reaction/blob/main/src/app.tsx), you can clone the repo and run locally to know it better.