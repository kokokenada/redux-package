import {
  Store,
  Action,
  Reducer,
  Middleware,
  StoreEnhancer,
} from 'redux';


// Sourced from https://github.com/angular-redux/store

import { Observable } from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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
export interface IDispatcher<RootState>  {
  getStore?(): Store<RootState> ;
  configureStore(
    reducer: Reducer<RootState>,
    initState: RootState,
    middleware: Middleware[],
    enhancers: StoreEnhancer<RootState>[]);

  select<S>(
    selector?: Selector<RootState, S>,
    comparator?: Comparator): Observable<S>;

  getState(): RootState;
  subscribe (listener: () => void);
  dispatch <A extends Action>(action: A): any;
}

export let webpacksticky1= '';
