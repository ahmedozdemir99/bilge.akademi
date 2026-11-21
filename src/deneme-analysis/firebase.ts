import { getFirestore } from 'firebase/firestore/lite';
import { app } from '../lib/firebase';
import config from '../../firebase-applet-config.json';

export const db = getFirestore(app, config.firestoreDatabaseId);
export const legacyDb = getFirestore(app, 'ai-studio-denemetakipasist-6e57d3a4-0182-4b84-82e8-b3e61d62525d');
