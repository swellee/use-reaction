# use-reaction
react modulized store manager framework based on react hooks.
easy to manage your app's states in modulized way.
small package size(about 100 lines only)
# repo
here is [Repo](https://github.com/swellee/use-reaction), If you like this framework, consider give me a star!
# install
```shell
npm i use-reaction
```
# apis
1. `useReaction` - the initial function of this framework, you can enableDevtool on development mode, (not recommend to enable dev on production mode)
2. `useProvider` - return the Provider used to wrap your app's root component
3. `useModel` - retrive the {***store***, ***doAction***, ***resetModel***} of given model instance
   1. `store` - the store of this model
   2. `doAction` - the action trigger, accept 3 params, these are:
      1. ***action*** - the function (normal or PromiseLike), which can return changed part of model's Interface, or return nothing, or return `justBack(data)` to avoid modify store
      2. ***payload*** - the paload which will pass to the ***action*** function,
      3. ***showLoading*** - whether showloading when process this action, you can pass param ***model*** or ***global*** and, `model` means change loading state for this model-store, `global` means change loading for global, default undefined, see `useLoading`
      4. Note: the doAction is an async function, and will return what the ***action*** function's return-data, so you can get the result-data of the ***action*** function
   3. `resetModel` - the trigger for reset the given model to its initial state when it's defined
4. `useLoading` - retrieve the loading flag(true/false) of given model-instance, if not provide model, then it will return the global loading flag, this flag will change when call `doAction(someAction, payload, 'model' | 'global')`
5. `justBack` - sometimes, your action don't want to modify the model store, just want to process sth and return the data back to UI level, then you can use this api to wrap your return data, so that the return data of your action won't trigger modify and won't trigger rerender, like this:
    ```typescript
    export const actionJustBackData: Action<typeof model_b> = async function({ payload }) {
        ... do process task ...
       return justBack('hello' + payload)
   }
    ```

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
              sth: 'hello world' // Note: this field will be ignored and won't be added into model_a b/c the field 'sth' is not defined in ModelA !!!
          }
      }
    ```
4. call **useModel(model_a)** in your non-root Component to get certain model's store and action-dispatcher, here is the full featured example:
    ```typescript
    // the global loading wrapper
    function GlobalLoading(props: KV) {
       const loading = useLoading()
       return < Spin spinning={loading} >
           {props.children}
       </Spin >
    }
    // one child component
    function SubPageA(props?: KV) {
       const { store, doAction } = useModel(model_a)
       const { store: storeB, doAction: doActionB } = useModel(model_b)

       const onfinish = (values: any) => {
           console.log('values', values)
           doAction(actionTestA, 2, 'global') // execute actionTestA with global loading
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
   // another Child component
   function SubPageB(props: KV) {
       const { store, doAction } = useModel(model_b)
       const loading = useLoading(model_b)// listen to model_b's loading state
       return (
           <Spin spinning={loading}>

               <div className="page page-b">
                   <h3>page B</h3>
                   <div>
                       value B is {store.b}
                   </div>
                   <button onClick={e => {
                       doAction(actionTestB, 'do action with loading', 'model') // execute actionTestB with model-loading
                   }}>Increse B with model loading</button>

                   <h6>see my child compenent below:</h6>
                   {props.children}
               </div>
           </Spin>

       )
   }
    // yet another deep-child component, show how to reset your model-store
   function CompC() {
       const { store, resetModel } = useModel(model_a)
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
       </div>
   }
    ```
    
# more details, see the [example](https://github.com/swellee/use-reaction/blob/main/src/app.tsx), you can clone the repo and run locally to know it better.