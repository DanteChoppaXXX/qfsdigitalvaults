// src/emails/withdrawalEmails.js

export const COMPANY_NAME = "Quantum Financial System";
export const PAYMENT_METHOD = "Bitcoin (BTC)";

/**
 * SERVICE FEE EMAIL
 */
export const SERVICE_FEE_EMAIL = {
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_SERVICE_FEE,
  getParams: ({ to_name, to_email, amount }) => ({
    to_name,
    to_email,
    company_name: COMPANY_NAME,
    fee_type: "Service Processing Fee",
    amount,
    payment_method: PAYMENT_METHOD,
    subject: "Withdrawal Processing – Service Fee Required",
    message_body: `
We are writing to inform you that your withdrawal request has been successfully initiated and is currently undergoing standard processing.

As part of our withdrawal procedure, a mandatory service processing fee is required to proceed to the next stage. This fee covers transaction handling, verification, and network processing costs associated with your withdrawal.

Once payment is confirmed on the blockchain, your withdrawal process will automatically advance to the next step.

If you have already completed this payment, please disregard this message.
    `.trim(),
  }),
};

/**
 * TAX FEE EMAIL
 */
export const TAX_FEE_EMAIL = {
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_TAX_FEE,
  getParams: ({ to_name, to_email, amount }) => ({
    to_name,
    to_email,
    company_name: COMPANY_NAME,
    fee_type: "Tax Clearance Fee",
    amount,
    payment_method: PAYMENT_METHOD,
    subject: "Withdrawal Processing – Tax Clearance Required",
    message_body: `
Your withdrawal request has progressed successfully.

Before final disbursement can be completed, a statutory tax clearance fee is required in compliance with applicable financial and regulatory guidelines.

This payment is mandatory and must be completed to finalize your withdrawal.

If payment has already been completed, no further action is required.
    `.trim(),
  }),
};

/**
 * FINAL CLEARANCE FEE EMAIL
 */
export const FINAL_CLEARANCE_FEE_EMAIL = {
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_FINAL_CLEARANCE,
  getParams: ({ to_name, to_email, amount }) => ({
    to_name,
    to_email,
    company_name: COMPANY_NAME,
    fee_type: "Final Network Clearance Fee",
    amount,
    payment_method: PAYMENT_METHOD,
    subject: "Final Withdrawal Clearance – Network Release Fee Required",
    message_body: `
Your withdrawal request has successfully passed the initial processing and tax compliance stages.

To complete the final release of your funds, a one-time network clearance and release fee is required. This fee covers final blockchain authorization, liquidity settlement, and secure fund release.

Once this payment is confirmed on the blockchain, your withdrawal will be released immediately.

Please note that this is the final stage of the withdrawal process.
    `.trim(),
  }),
};

