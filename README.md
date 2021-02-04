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
            b: 1,
            c: 1,
            d: {
                dd: 1
            },
        }`
    ```
4. call **useModel(model_a)** in your non-root Component to get certain model's store and dispacher, like this:
    ```typescript
    function SubPageA(props?: KV) {
       const { store, dispatch } = useModel(model_a)
       const actionIncreseMulti = dispatch(actionTestA)

       return (
           <div className="page page-a">
               <h3>page A</h3>
               <div>
                   model_a.a value is {store.a}
               </div>
               <button onClick={e => {
                   /** store first-level prop is interactive,*/
                    /**so you can modify it directly */
                   store.a++
               }}>Increse a</button>

               <button onClick={e => {
                   actionIncreseMulti(2)
                   /** 
                    * action return a promise, 
                    * so if you want to do sth after a time-cost action,
                    * you can try like this:
                    * actionIncreseMulti(2).then(_ => {
                    *    do sth after the current action done
                    *    ...
                    * })
                   */
                   }}>Increse a & b by action</button>
               <button onClick={
                   /** 
                    * when call useModel, the const model was just used to clearify model structor,
                    * so, its origin values were never modified.
                    * so, here, we can use a function which simply return the original const model to reset the state! */
                  dispatch(() => model_a)
              }>reset model_a</button>
           </div>
          )
       }
    ```
    

# more details, see the [example](https://github.com/swellee/use-reaction/blob/main/src/app.tsx)