// Manually copied into index to work around build problem
import {Action} from 'redux';

export interface IActionError {
  error: string | number;
  reason ?: string;
  details ?: string;
  message ?: string;
}

export interface IPayloadAction extends Action {
  payload?: any;
  error?: IActionError;
}


export interface IAppState {
}

