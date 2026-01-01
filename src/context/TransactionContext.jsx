import React, { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import BitcoinPrice from "../components/BitcoinPrice"; // ✅ Import BTC rate component

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [loading, setLoading] = useState(true);
  const [btcRate, setBtcRate] = useState(() => {
    // ✅ Load cached BTC rate on init (fallback 68k)
    const cached = localStorage.getItem("btcRate");
    return cached ? parseFloat(cached) : 68000;
  });

  // ✅ Save BTC rate whenever it updates
  useEffect(() => {
    if (btcRate && typeof btcRate === "number") {
      localStorage.setItem("btcRate", btcRate.toString());
    }
  }, [btcRate]);

  useEffect(() => {
    let unsubUser = null;
    let unsubTx = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setTransactions([]);
        setBalanceUSD(0);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);

        // Ensure user doc exists
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, { balanceUSD: 0 });
          setBalanceUSD(0);
        } else {
          setBalanceUSD(snap.data().balanceUSD || 0);
        }

        // Real-time balance listener
        unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setBalanceUSD(docSnap.data().balanceUSD || 0);
          }
        });

        // Real-time transaction listener
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        unsubTx = onSnapshot(
          q,
          (snapshot) => {
            const txs = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                type: data.type?.toLowerCase() || "",
              };
            });
            setTransactions(txs);
            setLoading(false);
          },
          (error) => {
            console.error("Transactions listener error:", error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("TransactionProvider error:", err);
        setLoading(false);
      }
    });

    // Cleanup listeners
    return () => {
      unsubscribeAuth();
      if (unsubUser) unsubUser();
      if (unsubTx) unsubTx();
    };
  }, []);

  // ✅ Add new transaction
  const addTransaction = async (type, amountUSD) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const normalizedType = type.toLowerCase();
    const newBalance =
      normalizedType === "deposit"
        ? balanceUSD + amountUSD
        : balanceUSD - amountUSD;

    // Update Firestore user balance
    await updateDoc(userRef, { balanceUSD: newBalance });
    setBalanceUSD(newBalance);

    // Add Firestore transaction record
    await addDoc(collection(db, "transactions"), {
      userId: user.uid,
      type: normalizedType,
      amountUSD,
      amountBTC: (amountUSD / btcRate).toFixed(6), // ✅ uses live or cached BTC rate
      status: "Success",
      createdAt: serverTimestamp(),
    });
  };

  // ✅ Reset context (e.g. on logout)
  const resetData = () => {
    setBalanceUSD(0);
    setTransactions([]);
    setLoading(false);
  };

  // ✅ Add a pending withdrawal (no balance change)
    const addPendingWithdrawal = async ({ amountUSD, coin, address }) => {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "withdrawal",
        amountUSD,
        amountBTC: (amountUSD / btcRate).toFixed(6),
        coin,
        address,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        balanceUSD,
        loading,
        addTransaction,
        addPendingWithdrawal,
        resetData,
        btcRate, // ✅ available globally
      }}
    >
      {/* ✅ Hidden BTC rate component keeps rate fresh */}
      <div style={{ display: "none" }}>
        <BitcoinPrice onRateChange={setBtcRate} />
      </div>

      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);

