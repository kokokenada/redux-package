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
import {IDispatcher} from './index';
import {Comparator, Selector} from './dispatcher-type';
import {Observable} from 'rxjs/Observable';

export interface ICombinerOptions {
  consoleLogging?: boolean;
  otherMiddlewares?: any[]; // Todo: add type
}

export class ReduxPackageCombiner {
  private static _ngRedux: IDispatcher<IAppState>;
  private static _store;

  public static setMockDispatch(dispatch: (action: IPayloadAction)=>void ) {
    ReduxPackageCombiner.dispatch = dispatch;
  }

  public static dispatch(action: IPayloadAction) {
    ReduxPackageCombiner._ngRedux.dispatch(action);
  }

  public static getDispatcher(): IDispatcher<IAppState> {
    return ReduxPackageCombiner._ngRedux;
  }

  public static select<S>(
    selector?: Selector<IAppState, S>,
    comparator?: Comparator): Observable<S> {

    return ReduxPackageCombiner._ngRedux.select(selector, comparator);
  }

  /**
   * Resets so it can be reconfigured (only required for tests)
   */
  public static reset() {
    ReduxPackageCombiner.configured = false;
  }

  public static getStore() { // Type???
    return ReduxPackageCombiner._store;
  }

  private static configured = false;

  /**
   * Logs all actions and states after they are dispatched.
   */
  private static logger = store => next => action => {
    if (typeof console.group === 'function')
      console.group(action.type);
    console.info('Logger: dispatching:', action);
    let result = next(action);
    console.log('Logger: next state', store.getState());
    if (typeof console.groupEnd === 'function')
      console.groupEnd();
    return result;
  };

  /**
   * Configures passed modules and readies them for execution
   *
   * @param modules
   * @param ngRedux - pass ngRedux if using it, null if using React
   * @param options
   */
  static configure(modules: ReduxPackage<IAppState, IPayloadAction>[],
            ngRedux: IDispatcher<IAppState>,
            options: ICombinerOptions = {
              consoleLogging: false,
              otherMiddlewares: []
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
    ReduxPackageCombiner._ngRedux = ngRedux;
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
    if (options.otherMiddlewares) {
      options.otherMiddlewares.forEach( (middleware) => {
        middlewares.push(middleware);
      } );
    }
    const rootReducer = combineReducers<IAppState>(reducers);
    ngRedux.configureStore(rootReducer, {}, middlewares, enhancers);
    if (ngRedux.getStore) {
      ReduxPackageCombiner._store = ngRedux.getStore();
    }
    modules.forEach((module: ReduxPackage<IAppState, IPayloadAction>)=> {
      module.initialize();
    });

  }
}
