import {
  Store,
  Action,
  Reducer,
  Middleware,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
  Unsubscribe,
  createStore,
  applyMiddleware,
  compose
} from 'redux';

type RetypedCompose = (func: Function, ...funcs: Function[]) => Function;


/**
 * An alternative to ngRedux when not using Angular
 */
export class Dispatcher<RootState> {
  private _store: Store<RootState> = null;

  /**
   * configures a Redux store and allows NgRedux to observe and dispatch
   * to it.
   *
   * This should only be called once for the lifetime of your app, for
   * example in the constructor of your root component.
   *
   * @param reducer Your app's root reducer
   * @param initState Your app's initial state
   * @param middleware Optional Redux middlewares
   * @param enhancers Optional Redux store enhancers
   */
  configureStore(
    reducer: Reducer<RootState>,
    initState: RootState,
    middleware: Middleware[] = [],
    enhancers: StoreEnhancer<RootState>[] = []) {

    if (this._store) {
      throw new Error('Store already configured!');
    }

    const reTypedCompose = compose as RetypedCompose;
    const finalCreateStore = <StoreEnhancerStoreCreator<RootState>>reTypedCompose(
      applyMiddleware(...middleware),
      ...enhancers
    )(createStore);
    const store = finalCreateStore(reducer, initState);

    this.setStore(store);
  }
  /**
   * Dispatch an action to Redux
   */
  dispatch = <A extends Action>(action: A): any => {
    if (!this._store) {
      throw new Error('Dispatch failed: did you forget to configure your store? ' +
        'https://github.com/angular-redux/@angular-redux/core/blob/master/' +
        'README.md#quick-start');
    }

    this._store.dispatch(action);
  };

  private setStore(store: Store<RootState>) {
    this._store = store;
  }
}