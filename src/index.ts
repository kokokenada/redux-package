export * from './redux-package.class';
export * from './redux-package-combiner';


//export * from './action.interface'; Copied below to work around build problem

import { Action } from 'redux';
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

