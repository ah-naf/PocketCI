import type { DeviceFlowConfig } from './deviceFlow';

export const GITHUB_CLIENT_ID = 'Ov23limVL70VCuVM5f8B';

export const GITHUB_DEVICE_FLOW: DeviceFlowConfig = {
  clientId: GITHUB_CLIENT_ID,
  scope: 'repo workflow',
  deviceCodeUrl: 'https://github.com/login/device/code',
  tokenUrl: 'https://github.com/login/oauth/access_token',
};
