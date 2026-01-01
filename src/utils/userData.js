import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

/* 
===========================
 🧩 USER DATA UTILITIES
===========================
Handles:
 - Fetching user profile
 - Updating user fields (like balance)
 - Recording transactions
 - Getting user transactions
*/

// ✅ Get the user document reference
const getUserRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");
  return doc(db, "users", user.uid);
};

// ✅ Fetch user data from Firestore
export const getUserData = async () => {
  const userRef = getUserRef();
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) throw new Error("User data not found");
  return { id: snapshot.id, ...snapshot.data() };
};

// ✅ Update user data (e.g., balance, profile info)
export const updateUserData = async (data) => {
  const userRef = getUserRef();
  await updateDoc(userRef, data);
};

// ✅ Record a transaction under user’s subcollection
export const addTransaction = async (transaction) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const txRef = collection(db, "users", user.uid, "transactions");

  const txData = {
    ...transaction,
    createdAt: new Date().toISOString(),
    userId: user.uid,
  };

  await addDoc(txRef, txData);

  // Optionally update user balance
  if (transaction.type === "deposit") {
    await updateBalance(transaction.amount);
  } else if (transaction.type === "withdraw") {
    await updateBalance(-transaction.amount);
  }

  return txData;
};

// ✅ Fetch all user transactions (sorted newest first)
export const getUserTransactions = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const txRef = collection(db, "users", user.uid, "transactions");
  const q = query(txRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ Helper to update balance safely
export const updateBalance = async (amountChange) => {
  const userRef = getUserRef();
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) throw new Error("User document not found");
  const currentBalance = snapshot.data().balance || 0;

  const newBalance = currentBalance + amountChange;
  await updateDoc(userRef, { balance: newBalance });

  return newBalance;
};

