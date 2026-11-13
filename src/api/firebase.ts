import { ApiError } from './errors';
import { httpRequest } from './http';

export type UserData = { data: string; updatedAt: string };

// Public web key; Firestore rules limit what it can do.
const FIREBASE_API_KEY = 'AIzaSyDfcNCPH-xA69sCrbQN4eE8z5CDyBteFKo';
const FIREBASE_PROJECT_ID = 'pocketci-677fa';

const documentUrl = (userId: string) =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${encodeURIComponent(userId)}?key=${FIREBASE_API_KEY}`;

type FirestoreDocument = { fields?: { data?: { stringValue?: string }; updatedAt?: { stringValue?: string } } };

export async function fetchUserData(userId: string): Promise<UserData | null> {
  const { text, status } = await httpRequest(documentUrl(userId), { acceptErrorStatus: true });
  if (status === 404) return null;
  if (status >= 400) throw new ApiError('http', status, 'Could not load saved settings');
  const fields = (JSON.parse(text) as FirestoreDocument).fields;
  const data = fields?.data?.stringValue;
  const updatedAt = fields?.updatedAt?.stringValue;
  return data !== undefined && updatedAt !== undefined ? { data, updatedAt } : null;
}

export async function saveUserData(userId: string, { data, updatedAt }: UserData) {
  await httpRequest(documentUrl(userId), {
    method: 'PATCH',
    body: { fields: { data: { stringValue: data }, updatedAt: { stringValue: updatedAt } } },
  });
}
