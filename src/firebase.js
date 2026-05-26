/**
 * Firebase configuration.
 * All values come from Vite env variables — never hard-code keys here.
 *
 * Firestore security rules to apply in Firebase Console → Firestore → Rules:
 * ─────────────────────────────────────────────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{uid} {
 *       allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
 *       allow write: if request.auth != null && request.auth.uid == uid;
 *       allow update: if request.auth != null && isAdmin();
 *     }
 *     match /habits/{uid}/entries/{entryId} {
 *       allow read, write: if request.auth != null && request.auth.uid == uid;
 *       allow read: if request.auth != null && isAdmin();
 *     }
 *     match /adminConfig/{doc} {
 *       allow read: if request.auth != null;
 *       allow write: if isAdmin();
 *     }
 *     function isAdmin() {
 *       return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *   }
 * }
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Admin bootstrap (first deploy only):
 *   1. Firebase Console → Firestore → Create collection: adminConfig
 *   2. Document ID: roles
 *   3. Add field: adminEmails (Array) → add your Google email address
 *   After that, anyone in adminEmails gets role:"admin" automatically on first sign-in.
 */
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
