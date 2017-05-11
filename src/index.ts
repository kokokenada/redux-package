export * from './redux-package.class';
export * from './redux-package-combiner';


//export * from './action.interface'; Copied below to work around build problem

import {
  Store,
  Action,
  Reducer,
  Middleware,
  StoreEnhancer,
} from 'redux';


export interface IActionError {
  error: string | number;
  reason ? : string;
  details ? : string;
  message ? : string;
}

export interface IPayloadAction extends Action {
  payload?: any;
  error?:IActionError;
}


export interface IAppState {
}


// This stuff here to work around webpack not working when you import 'dispatcher-type'

import { Observable } from 'rxjs/Observable';
export type PropertySelector = string | number | symbol;
export type PathSelector = (string | number)[];
export type FunctionSelector<RootState, S> = ((s: RootState) => S);
export type Selector<RootState, S> = PropertySelector |
  PathSelector |
  FunctionSelector<RootState, S>;

export type Comparator = (x: any, y: any) => boolean;
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