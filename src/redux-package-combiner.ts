import { Injectable } from '@angular/core';

import {combineReducers, ReducersMapObject} from 'redux';
import {NgRedux} from "@angular-redux/store";

import {IAppState} from "./index";
import {ReduxPackage} from "./redux-package.class";
import {createEpicMiddleware} from 'redux-observable';
import {IPayloadAction} from "./index";

@Injectable()
export class ReduxPackeCombiner {
  private reducers: ReducersMapObject = {};
  private middlewares: any[] = []; // TODO: How to I properly type this?
  private enhancers: any[] = [];
  public static ngRedux: NgRedux<IAppState>;
  public static dispatch: <A extends IPayloadAction>(action: A) => any;

  private configured = false;

  /**
   * Logs all actions and states after they are dispatched.
   */
  private logger = store => next => action => {
    console.group(action.type);
    console.info('Logger: dispatching:', action)
    let result = next(action);
    console.log('Logger: next state', store.getState())
    console.groupEnd();
    return result;
  };

  turnOnConsoleLogging() {
    this.middlewares.push(this.logger);
  }

  configure(modules: ReduxPackage<IAppState, IPayloadAction>[],
            ngRedux: NgRedux<IAppState>) {
    if (this.configured) {
      console.warn("ReduxModuleCombiner.configure() called twice. Not performing re-initialization, but something is amiss.");
      console.trace('ReduxModuleCombiner.configure() called twice');
      return;
    }
    this.configured = true;


    ReduxPackeCombiner.ngRedux = ngRedux;
    modules.forEach((module: ReduxPackage<IAppState, IPayloadAction>)=> {

      module.reducers.forEach( (reducer:any)=>{
        let reducerInModule: ReducersMapObject = {};
        if (this.reducers[reducer.name]) {
          throw "Two included reducers have the identical name of " + reducer.name;
        }
        reducerInModule[reducer.name] = reducer.reducer;
        this.reducers = Object.assign(this.reducers, reducerInModule);
      } );
      module.epics.forEach((epic)=> {
        this.middlewares.push(createEpicMiddleware(epic))
      });
      module.middlewares.forEach((middleware)=> {
        this.middlewares.push(middleware)
      });
      module.enhancers.forEach((enhancer)=> {
        this.enhancers.push(enhancer)
      });
    });
    const rootReducer = combineReducers<IAppState>(this.reducers);
    ngRedux.configureStore(rootReducer, {}, this.middlewares, this.enhancers);
    modules.forEach((module: ReduxPackage<IAppState, IPayloadAction>)=> {
      module.initialize();
    })
  }
}
