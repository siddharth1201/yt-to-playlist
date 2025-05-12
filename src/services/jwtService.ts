import { jwtDecode } from 'jwt-decode';


export interface GoogleUserInfo {
    name?: string;
    email?: string;
    picture?: string;
    [key: string]: any;
}

export function decodeGoogleCredential(credential: string): GoogleUserInfo {
    try {
      return jwtDecode<GoogleUserInfo>(credential);
    } catch {
      return {};
    }
  }