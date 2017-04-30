
import { Reducer } from "redux";
/*import {Observable} from 'rxjs/Rx';*/

import { Epic } from 'redux-observable';

export abstract class ReduxPackage<STATE, ACTION> {
  abstract reducers:{name: string, reducer:Reducer<STATE>}[];
  epics=[];        // Stream based middleware To do, Type this. Epic<ACTION, STATE>[]  had problems
  middlewares:any[]=[];   // Normal redux middleware
  enhancers:any[]=[];
  actions:Object;
  initialize():void {};
}
// (action$: ActionsObservable<T>, store: MiddlewareAPI<S>): Observable<T>;