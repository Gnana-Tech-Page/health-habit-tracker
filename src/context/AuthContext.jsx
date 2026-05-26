import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc, getDocs,
  collection, serverTimestamp, increment, query, orderBy,
  deleteField,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

async function getOrCreateUserProfile(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(userRef)

  if (snap.exists()) {
    await updateDoc(userRef, {
      lastLogin:   serverTimestamp(),
      loginCount:  increment(1),
      displayName: firebaseUser.displayName,
      photoURL:    firebaseUser.photoURL,
    })
    return { ...snap.data(), uid: firebaseUser.uid }
  }

  // First sign-in: check adminEmails list to assign role
  const adminSnap = await getDoc(doc(db, 'adminConfig', 'roles'))
  const adminEmails = adminSnap.exists() ? (adminSnap.data().adminEmails || []) : []
  const role = adminEmails.includes(firebaseUser.email) ? 'admin' : 'user'

  const profile = {
    uid:         firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email:       firebaseUser.email,
    photoURL:    firebaseUser.photoURL,
    role,
    disabled:    false,
    createdAt:   serverTimestamp(),
    lastLogin:   serverTimestamp(),
    loginCount:  1,
  }
  await setDoc(userRef, profile)
  return profile
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getOrCreateUserProfile(firebaseUser)
          if (profile.disabled) {
            await firebaseSignOut(auth)
            setCurrentUser({ _disabled: true })
          } else {
            setCurrentUser({ ...firebaseUser, ...profile })
          }
        } catch (err) {
          console.error('Profile fetch error:', err)
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    return result
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  // Admin: get all user profiles
  async function getAllUsers() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'asc')))
    return snap.docs.map(d => ({ ...d.data(), uid: d.id }))
  }

  // Admin: toggle role between 'admin' and 'user'
  async function toggleUserRole(uid) {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const newRole = snap.data().role === 'admin' ? 'user' : 'admin'
    await updateDoc(ref, { role: newRole })
    return newRole
  }

  // Admin: disable / re-enable a user
  async function setUserDisabled(uid, disabled) {
    await updateDoc(doc(db, 'users', uid), { disabled })
  }

  const isAdmin = currentUser?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      currentUser, loading, isAdmin,
      signInWithGoogle, signOut,
      getAllUsers, toggleUserRole, setUserDisabled,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
