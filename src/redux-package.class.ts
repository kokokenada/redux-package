
import { Reducer } from "redux";
import { Epic } from 'redux-observable';

export abstract class ReduxPackage<STATE, ACTION> {
  abstract reducers:{name: string, reducer:Reducer<STATE>}[];
  epics:Epic<ACTION, STATE>[]=[];        // Stream based middleware
  middlewares:any[]=[];   // Normal redux middleware
  enhancers:any[]=[];
  actions:Object;
  initialize():void {};
}
