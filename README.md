# use-reaction
react modulized store manager framework based on react hooks.
easy to manage your app's states in modulized way.
small package size(about 100 lines only)
# install
```shell
npm i use-reaction
```
# how to use
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
                <SubPageA />
                <Sth />
                ...
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
              aa: {aa: store.aa.aa + payload},
              sth: 'hello world' // Note: this field will be ignored and won't be added into model_a b/c the field 'sth' is not defined in ModelA !!!
          }
      }
    ```
4. call **useModel(model_a)** in your non-root Component to get certain model's store and action-dispatcher, like this:
    ```typescript
    function SubPageA(props?: KV) {
          const loading = useLoading()
          const { store, doAction } = useModel(model_a)
          const { store: storeB, doAction: doActionB } = useModel(model_b)

          const onfinish = (values: any) => {
              console.log('values', values)
              doAction(actionTestA, 2)
          }
          return (
              <Spin spinning={loading}>

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
                          <Button htmlType="submit">increase value A </Button>
                      </Form>
                      <button onClick={async e => {
                          const backed = await doActionB(actionJustBackData, ',world:' + Date.now())
                          alert(backed)
                      }}>just back data</button>
                  </div>
              </Spin>

          )
      }
    ```
    
# apis
1. `useReaction` - the initial function of this framework
2. `useProvider` - return the Provider used to wrap your app's root component
3. `useModel` - retrive the {***store***, ***doAction***, ***resetModel***} of given model instance
   1. `store` - the store of this model
   2. `doAction` - the action trigger, accept 3 params, these are:
      1. ***action*** - the function (normal or PromiseLike), which can return changed part of model's Interface, or return nothing, or return `justBack(data)` to avoid modify store
      2. ***payload*** - the paload which will pass to the ***action*** function,
      3. ***showLoading*** - whether modify global's loading flag, see `useLoading`
      4. Note: the doAction is an async function, and will return what the ***action*** function's return-data, so you can get the result-data of the ***action*** function
   3. `resetModel` - the trigger for reset the given model to its initial state when it's defined
4. `useLoading` - retrieve the global loading flag(true/false), this flag will change when call `doAction(someAction, payload, true)`
5. `justBack` - sometimes, your action don't want to modify the model store, just want to process sth and return the data back to UI level, then you can use this api to wrap your return data, so that the return data of your action won't trigger modify and won't trigger rerender, like this:
    ```typescript
    export const actionJustBackData: Action<typeof model_b> = async function({ payload }) {
        ... do process task ...
       return justBack('hello' + payload)
   }
    ```
# known issues
in dev hot-reload mode, when you modify your code, the browser may show render errors, it's b/c the global store was not initialized when hot-reload.
this issue not affect your built app, so no worries. but I'm trying to resolve this in the future. just a reminder here :D 
# more details, see the [example](https://github.com/swellee/use-reaction/blob/main/src/app.tsx)