import type { Env } from '../types/env';
import { registerUser, loginUser, getSession, logoutUser, recoverUser } from '../lib/auth_service';

export async function postAuthRegister(request: Request, env: Env): Promise<Response> {
  return await registerUser(request, env);
}

export async function postAuthLogin(request: Request, env: Env): Promise<Response> {
  return await loginUser(request, env);
}

export async function getAuthSession(request: Request, env: Env): Promise<Response> {
  return await getSession(request, env);
}

export async function postAuthLogout(request: Request, env: Env): Promise<Response> {
  return await logoutUser(request, env);
}

export async function postAuthRecover(request: Request, env: Env): Promise<Response> {
  return await recoverUser(request, env);
}
