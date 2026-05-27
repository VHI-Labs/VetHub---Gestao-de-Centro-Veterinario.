const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string
}

type FirebaseCompat = {
  initializeApp: (config: Record<string, string>) => void
  database: () => unknown
}

let firebaseDatabase: unknown = null
let firebaseInitialized = false

declare global {
  interface Window {
    firebase?: FirebaseCompat
  }
}

export function initFirebase() {
  if (firebaseInitialized) return firebaseDatabase

  const fb: FirebaseCompat | undefined = window.firebase
  if (!fb) {
    console.warn('[HOVET Firebase] SDK do Firebase não foi encontrado na página.')
    return null
  }

  try {
    fb.initializeApp(firebaseConfig)
    firebaseDatabase = fb.database()
    firebaseInitialized = true
    console.log('[HOVET Firebase] ✅ Inicializado com sucesso.')
    return firebaseDatabase
  } catch (e) {
    console.error('[HOVET Firebase] Erro ao inicializar:', e)
    return null
  }
}
