import { buildQuery, httpRequest } from './http';

export const GITHUB_CLIENT_ID = 'Ov23limVL70VCuVM5f8B';
const GITHUB_SCOPES = 'repo workflow';
const GITHUB_LOGIN_URL = 'https://github.com/login';
const SLOW_DOWN_SECONDS = 5;

export type DeviceCode = {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  intervalSeconds: number;
  expiresAt: number;
};

export class DeviceFlowError extends Error {
  constructor(readonly reason: 'expired' | 'denied') {
    super(reason === 'expired' ? 'The code expired' : 'Access was denied on GitHub');
    this.name = 'DeviceFlowError';
  }
}

async function postJson(path: string, params: Record<string, string>) {
  const { text } = await httpRequest(`${GITHUB_LOGIN_URL}${path}${buildQuery(params)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  return JSON.parse(text) as Record<string, unknown>;
}

export async function requestDeviceCode(): Promise<DeviceCode> {
  const data = await postJson('/device/code', { client_id: GITHUB_CLIENT_ID, scope: GITHUB_SCOPES });
  return {
    deviceCode: String(data.device_code),
    userCode: String(data.user_code),
    verificationUri: String(data.verification_uri),
    intervalSeconds: Number(data.interval),
    expiresAt: Date.now() + Number(data.expires_in) * 1000,
  };
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new Error('Cancelled'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    if (signal.aborted) return abort();
    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function pollForToken(code: DeviceCode, signal: AbortSignal): Promise<string> {
  let intervalSeconds = code.intervalSeconds;
  while (Date.now() < code.expiresAt) {
    await wait(intervalSeconds * 1000, signal);
    const data = await postJson('/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      device_code: code.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    });
    if (typeof data.access_token === 'string') return data.access_token;
    switch (data.error) {
      case 'authorization_pending':
        break;
      case 'slow_down':
        intervalSeconds = Number(data.interval) || intervalSeconds + SLOW_DOWN_SECONDS;
        break;
      case 'access_denied':
        throw new DeviceFlowError('denied');
      case 'expired_token':
        throw new DeviceFlowError('expired');
      default:
        throw new Error(String(data.error_description ?? data.error ?? 'GitHub sign-in failed'));
    }
  }
  throw new DeviceFlowError('expired');
}
