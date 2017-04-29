export * from './redux-package.class';
export * from './redux-package-combiner';

import { Action } from 'redux';

//export * from './action.interface'; Copied below to work around build problem
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

