import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import CoinSelectionModal from "./CoinSelectionModal";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

export default function DepositWithdrawController({ children }) {
  const [coinSelectOpen, setCoinSelectOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const actionRef = useRef(null);

  const openDepositFlow = () => {
    actionRef.current = "deposit";
    setCoinSelectOpen(true);
  };

  const openWithdrawFlow = () => {
    actionRef.current = "withdraw";
    setCoinSelectOpen(true);
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setCoinSelectOpen(false);

    if (actionRef.current === "deposit") {
      setDepositOpen(true);
    } else if (actionRef.current === "withdraw") {
      setWithdrawOpen(true);
    }
  };

  return (
    <>
      {children({
        openDeposit: openDepositFlow,
        openWithdraw: openWithdrawFlow,
      })}

      <CoinSelectionModal
        open={coinSelectOpen}
        onClose={() => setCoinSelectOpen(false)}
        onSelect={handleCoinSelect}
      />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        coin={selectedCoin}
      />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        coin={selectedCoin}
      />
    </>
  );
}

