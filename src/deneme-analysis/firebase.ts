import { getFirestore } from 'firebase/firestore';
import { app } from '../lib/firebase';

// Deneme Analiz and Bilge Akademi share authentication, but their archives use distinct databases.
export const db = getFirestore(app, 'ai-studio-denemetakipasist-6e57d3a4-0182-4b84-82e8-b3e61d62525d');
