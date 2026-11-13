import { buildQuery, httpRequest } from './http';

const SLOW_DOWN_SECONDS = 5;

export type DeviceToken = { accessToken: string; refreshToken?: string };

export type DeviceFlowConfig = { clientId: string; scope: string; deviceCodeUrl: string; tokenUrl: string };

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

async function postJson(url: string, params: Record<string, string>) {
  const { text } = await httpRequest(`${url}${buildQuery(params)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    // GitLab answers a pending authorization with HTTP 400 and an error body
    acceptErrorStatus: true,
  });
  return JSON.parse(text) as Record<string, unknown>;
}

export async function requestDeviceCode({ clientId, scope, deviceCodeUrl }: DeviceFlowConfig): Promise<DeviceCode> {
  const data = await postJson(deviceCodeUrl, { client_id: clientId, scope });
  if (typeof data.device_code !== 'string') {
    throw new Error(String(data.error_description ?? data.error ?? 'Could not start sign-in'));
  }
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

export async function pollForToken({ clientId, tokenUrl }: DeviceFlowConfig, code: DeviceCode, signal: AbortSignal): Promise<DeviceToken> {
  let intervalSeconds = code.intervalSeconds;
  while (Date.now() < code.expiresAt) {
    await wait(intervalSeconds * 1000, signal);
    const data = await postJson(tokenUrl, {
      client_id: clientId,
      device_code: code.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    });
    if (typeof data.access_token === 'string') {
      return { accessToken: data.access_token, refreshToken: typeof data.refresh_token === 'string' ? data.refresh_token : undefined };
    }
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
