const crypto = require("crypto");

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const {
  initializeApp
} = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

const MONNIFY_SECRET_KEY = defineSecret("MONNIFY_SECRET_KEY");

exports.monnifyWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [MONNIFY_SECRET_KEY]
  },
  async (req, res) => {

    // Only accept POST
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const rawBody = req.rawBody
        ? req.rawBody.toString("utf8")
        : JSON.stringify(req.body);

      const signature = req.headers["monnify-signature"];

      // Production signature verification
      if (signature) {
        const expectedSignature = crypto
  .createHmac(
    "sha512",
    MONNIFY_SECRET_KEY.value()
  )
  .update(rawBody)
  .digest("hex");

        if (signature !== expectedSignature) {
          console.warn("Invalid Monnify signature.");
          return res.status(401).send("Invalid signature");
        }
      }

      const payload = req.body;

      if (!payload) {
        return res.status(400).send("Empty payload");
      }

      const eventType = payload.eventType;
      const data = payload.eventData || {};

      // We only process successful payments
      if (eventType !== "SUCCESSFUL_TRANSACTION") {
        return res.status(200).send("Event received");
      }

      if (data.paymentStatus !== "PAID") {
        return res.status(200).send("Payment not paid");
      }

      const amount = Number(data.amountPaid || 0);

      if (!amount || amount <= 0) {
        return res.status(400).send("Invalid amount");
      }

      if (data.currency && data.currency !== "NGN") {
        return res.status(400).send("Invalid currency");
      }

      const transactionReference =
        data.transactionReference;

      if (!transactionReference) {
        return res.status(400).send(
          "Missing transaction reference"
        );
      }

      const destinationAccount =
        data.destinationAccountInformation?.accountNumber;

      if (!destinationAccount) {
        return res.status(400).send(
          "Missing destination account"
        );
      }

      /*
       * Find the RC DATA user whose reserved account
       * received this payment.
       */
      const usersSnapshot = await db
        .collection("users")
        .where(
          "reservedAccountNumber",
          "==",
          destinationAccount
        )
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        console.warn(
          "No RC DATA user found for account:",
          destinationAccount
        );

        return res.status(200).send(
          "Account not linked to user"
        );
      }

      const userDoc = usersSnapshot.docs[0];
      const userRef = userDoc.ref;

      const transactionRef = db
        .collection("transactions")
        .doc(transactionReference);

      /*
       * Firestore transaction makes the wallet credit
       * atomic and prevents duplicate webhook credits.
       */
      await db.runTransaction(async (firestoreTransaction) => {

        const existingTransaction =
          await firestoreTransaction.get(transactionRef);

        if (existingTransaction.exists) {
          console.log(
            "Duplicate transaction ignored:",
            transactionReference
          );

          return;
        }

        firestoreTransaction.update(userRef, {
          walletBalance: FieldValue.increment(amount)
        });

        firestoreTransaction.set(transactionRef, {
          userId: userDoc.id,
          type: "Wallet Funding",
          amount: amount,
          status: "Successful",
          paymentMethod:
            data.paymentMethod || "ACCOUNT_TRANSFER",
          transactionReference:
            transactionReference,
          paymentReference:
            data.paymentReference || "",
          destinationAccount:
            destinationAccount,
          currency: "NGN",
          createdAt: FieldValue.serverTimestamp()
        });
      });

      console.log(
        "Wallet funded successfully:",
        transactionReference,
        amount
      );

      return res.status(200).send("OK");

    } catch (error) {

      console.error(
        "Monnify webhook error:",
        error
      );

      return res.status(500).send(
        "Internal Server Error"
      );
    }
  }
);
