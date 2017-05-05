/*

// Need to import RxJS operators needed when working locally with npm link etc

import 'rxjs/add/operator/do';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';

*/

import {combineReducers, ReducersMapObject} from 'redux';
import {IAppState} from "./index";
import {ReduxPackage} from "./redux-package.class";
import {createEpicMiddleware} from 'redux-observable';
import {IPayloadAction} from "./index";
import {Dispatcher} from './dispatcher';

export interface ICombinerOptions {
  consoleLogging?: boolean
}

export class ReduxPackageCombiner {
  private static ngRedux;
  public static dispatch(action: IPayloadAction) {
    ReduxPackageCombiner.ngRedux.dispatch(action);
  }

  private static configured = false;

  /**
   * Logs all actions and states after they are dispatched.
   */
  private static logger = store => next => action => {
    console.group(action.type);
    console.info('Logger: dispatching:', action);
    let result = next(action);
    console.log('Logger: next state', store.getState());
    console.groupEnd();
    return result;
  };

  static configure(modules: ReduxPackage<IAppState, IPayloadAction>[],
            ngRedux,
            options: ICombinerOptions = {
              consoleLogging: false
            }
  ) {
    if (ReduxPackageCombiner.configured) {
      console.warn("ReduxModuleCombiner.configure() called twice. Not performing re-initialization, but something is amiss.");
      console.trace('ReduxModuleCombiner.configure() called twice');
      return;
    }
    ReduxPackageCombiner.configured = true;

    let reducers: ReducersMapObject = {};
    let enhancers: any[] = [];
    let middlewares: any[] = []; // TODO: How to I properly type this?

    if ( options.consoleLogging ) {
      middlewares.push(ReduxPackageCombiner.logger);
    }

    if (!ngRedux) { // No ngRedux passed, use our internal dispatcher
      ngRedux = new Dispatcher<IAppState>();
    }
    ReduxPackageCombiner.ngRedux = ngRedux;
    modules.forEach((module: ReduxPackage<IAppState, IPayloadAction>)=> {

      module.reducers.forEach( (reducer:any)=>{
        let reducerInModule: ReducersMapObject = {};
        if (reducers[reducer.name]) {
          throw "Two included reducers have the identical name of " + reducer.name;
        }
        reducerInModule[reducer.name] = reducer.reducer;
        reducers = Object.assign(reducers, reducerInModule);
      } );
      module.epics.forEach((epic)=> {
        middlewares.push(createEpicMiddleware(epic))
      });
      module.middlewares.forEach((middleware)=> {
        middlewares.push(middleware)
      });
      module.enhancers.forEach((enhancer)=> {
        enhancers.push(enhancer)
      });
    });
    const rootReducer = combineReducers<IAppState>(reducers);
    ngRedux.configureStore(rootReducer, {}, middlewares, enhancers);
    modules.forEach((module: ReduxPackage<IAppState, IPayloadAction>)=> {
      module.initialize();
    })
  }
}
