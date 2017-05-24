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


// Sourced from https://github.com/angular-redux/store

import { Observable } from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import {IDispatcher} from './index';

type RetypedCompose = (func: Function, ...funcs: Function[]) => Function;
export type PropertySelector = string | number | symbol;
export type PathSelector = (string | number)[];
export type FunctionSelector<RootState, S> = ((s: RootState) => S);
export type Selector<RootState, S> = PropertySelector |
  PathSelector |
  FunctionSelector<RootState, S>;

export type Comparator = (x: any, y: any) => boolean;

/**
 * An alternative to ngRedux when not using Angular
 */
export class Dispatcher<RootState> implements IDispatcher<RootState> {
  private _store: Store<RootState> = null;
  private _store$: BehaviorSubject<RootState> = null;

  constructor() {
    this._store$ = new BehaviorSubject<RootState>(null)
      .filter(n => n !== null)
      .switchMap(
        (n) => {
          if (n instanceof Observable) {
            return Observable.from(n as any);
          } else {
            return Observable.of(n as any);
          }
        }) as BehaviorSubject<RootState>;
  }


  public getStore() {
    return this._store;
  }

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
   * Select a slice of state to expose as an observable.
   *
   * @typeparam S
   * @param selector key or function to select a part of the state
   * @param [comparer] Optional
   * comparison function called to test if an item is distinct
   * from the previous item in the source.
   *
   * @returns An Observable that emits items from the
   * source Observable with distinct values.
   */
  select<S>(
    selector?: Selector<RootState, S>,
    comparator?: Comparator): Observable<S> {

    let result: Observable<S>;
    const changedStore = this._store$.distinctUntilChanged();

    if (!selector) {
      return this._store$.distinctUntilChanged(comparator);
    } else if (
      typeof selector === 'string' ||
      typeof selector === 'number' ||
      typeof selector === 'symbol') {

      result = changedStore.map(state => state[selector as PropertySelector]);
    } else if (Array.isArray(selector)) {
      result = changedStore.map(state => getIn(state, selector as PathSelector));
    } else {
      result = changedStore.map(selector as FunctionSelector<RootState, S>);
    }

    return result.distinctUntilChanged(comparator);
  }

  /**
   * Get the current state of the application
   * @returns The application state
   */
  getState = (): RootState => this._store.getState()

  /**
   * Subscribe to the Redux store changes
   *
   * @param listener A callback to invoke when the state is updated
   * @returns A function to unsubscribe
   */
  subscribe = (listener: () => void): Unsubscribe => this._store.subscribe(listener)



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
    this._store$.next(store as any);
  }
}


/**
 * Gets a deeply-nested property value from an object, given a 'path'
 * of property names or array indices.
 *
 * @hidden
 */
function getIn(v, pathElems: (string | number)[]): any {
  if (!v) {
    return v;
  }

  // If this is an ImmutableJS structure, use existing getIn function
  if (typeof v.getIn === 'function') {
    return v.getIn(pathElems);
  }

  const [ firstElem, ...restElems] = pathElems;

  if (undefined === v[firstElem]) {
    return undefined;
  }

  if (restElems.length === 0) {
    return v[firstElem];
  }

  return getIn(v[firstElem], restElems);
}