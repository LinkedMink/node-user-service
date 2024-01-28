export interface IAuthenticateRequest {
  email: string;
  password: string;
}

export interface IKeyAuthenticateRequest {
  username: string;
  response?: string;
}
