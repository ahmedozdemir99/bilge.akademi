import { GoogleAuthProvider, reauthenticateWithPopup, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

const drive = 'https://www.googleapis.com/drive/v3';
const upload = 'https://www.googleapis.com/upload/drive/v3/files';
const fields = 'id,name,mimeType,createdTime,description,appProperties';
const fileFilter = "trashed = false and 'appDataFolder' in parents and appProperties has { key='bilgeDeneme' and value='1' }";
const limit = 10 * 1024 * 1024;

export type TrialCloudFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  description?: string;
  appProperties?: { kind?: string };
};

export type TrialBackupSettings = {
  title: string;
  examDate: string;
  pages: string;
  kind: 'school' | 'course';
  classId: string;
  wrongPenalty: 3 | 4;
};

export function readTrialBackupSettings(item: TrialCloudFile): Partial<TrialBackupSettings> {
  if (!item.description) return {};
  try {
    const settings = JSON.parse(item.description) as Partial<TrialBackupSettings>;
    return {
      title: typeof settings.title === 'string' ? settings.title.slice(0, 120) : undefined,
      examDate: typeof settings.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(settings.examDate) ? settings.examDate : undefined,
      pages: typeof settings.pages === 'string' && /^\d+(?:\s*[-–]\s*\d+)?$/.test(settings.pages) ? settings.pages : undefined,
      kind: settings.kind === 'course' ? 'course' : 'school',
      classId: typeof settings.classId === 'string' ? settings.classId : '',
      wrongPenalty: settings.wrongPenalty === 4 ? 4 : 3,
    };
  } catch {
    return {};
  }
}

export async function connectTrialDrive(user: User) {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.appdata');
  const result = await reauthenticateWithPopup(user, provider);
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token || auth.currentUser?.uid !== user.uid) throw new Error('Google Drive bağlantısı doğrulanamadı.');
  return token;
}

export class TrialDriveError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request(token: string, url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', 'Bearer ' + token);
  const response = await fetch(url, { ...init, headers });
  if (response.ok) return response;
  throw new TrialDriveError(response.status, response.status === 401
    ? 'Drive bağlantısının süresi doldu. Tekrar deneyin.'
    : response.status === 403
      ? 'Google Drive’a erişilemedi. Drive iznini ve kurum hesabınızın erişim ayarlarını kontrol edin.'
      : 'Google Drive işlemi tamamlanamadı. Tekrar deneyin.');
}

async function list(token: string, filter = fileFilter) {
  const files: TrialCloudFile[] = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      spaces: 'appDataFolder',
      q: filter,
      fields: 'nextPageToken,files(' + fields + ')',
      orderBy: 'createdTime desc',
      pageSize: '100',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const result: { files?: TrialCloudFile[]; nextPageToken?: string } = await (await request(token, drive + '/files?' + params)).json();
    files.push(...(result.files ?? []));
    pageToken = result.nextPageToken ?? '';
  } while (pageToken);
  return files;
}

export async function listTrialCloudFiles(token: string, kind: 'source' | 'archive' = 'source') {
  const files = await list(token);
  return files.filter((file) => (file.appProperties?.kind ?? 'source') === kind);
}

export async function uploadTrialCloudFile(token: string, file: File, settings: TrialBackupSettings | null, kind: 'source' | 'archive' = 'source') {
  if (!file.size || file.size > limit) throw new Error('Buluta 10 MB’a kadar dosya yükleyebilirsiniz.');
  const description = JSON.stringify(settings);
  const digest = await crypto.subtle.digest('SHA-256', await new Blob([file, description]).arrayBuffer());
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const existing = await list(token, fileFilter + " and appProperties has { key='sha256' and value='" + sha256 + "' }");
  if (existing[0]) return existing[0];
  const mimeType = file.type || 'application/octet-stream';
  const session = await request(token, upload + '?uploadType=resumable&fields=' + encodeURIComponent(fields), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Upload-Content-Type': mimeType },
    body: JSON.stringify({ name: file.name, parents: ['appDataFolder'], description, appProperties: { bilgeDeneme: '1', sha256, kind } }),
  });
  const location = session.headers.get('Location');
  if (!location || new URL(location).origin !== new URL(upload).origin) throw new Error('Drive yüklemesi başlatılamadı.');
  return (await (await request(token, location, { method: 'PUT', body: file })).json()) as TrialCloudFile;
}

export async function downloadTrialCloudFile(token: string, item: TrialCloudFile) {
  const response = await request(token, drive + '/files/' + encodeURIComponent(item.id) + '?alt=media');
  const content = await response.blob();
  if (!content.size || content.size > limit) throw new Error('Buluttaki dosyanın boyutu geçersiz.');
  return new File([content], item.name, { type: item.mimeType || content.type });
}
