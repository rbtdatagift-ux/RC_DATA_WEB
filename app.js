import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// ============================
// REGISTER
// ============================

window.registerUser = async function () {

  const name =
    document.getElementById("name").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const referral =
    document.getElementById("referral").value.trim();


  if (!name || !email || !password) {
    alert("Please fill all required fields.");
    return;
  }


  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }


  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = userCredential.user;


    // Generate referral code
    const referralCode =
      "RC" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    // Save user information
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: name,
        email: email,
        walletBalance: 0,
        referralCode: referralCode,
        referredBy: referral || "",
        createdAt: new Date().toISOString()
      }
    );


    alert("Account created successfully!");


    window.location.href = "index.html";


  } catch (error) {

    console.error(error);


    if (error.code === "auth/email-already-in-use") {

      alert("This email is already registered.");

    } else if (error.code === "auth/invalid-email") {

      alert("Invalid email address.");

    } else if (error.code === "auth/weak-password") {

      alert("Password is too weak.");

    } else {

      alert(error.message);

    }

  }

};



// ============================
// LOGIN
// ============================

window.loginUser = async function () {

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  if (!email || !password) {

    alert("Enter your email and password.");

    return;
  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    alert("Login successful!");


    window.location.href = "index.html";


  } catch (error) {

    console.error(error);


    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password"
    ) {

      alert("Incorrect email or password.");

    } else if (
      error.code === "auth/user-not-found"
    ) {

      alert("Account not found.");

    } else if (
      error.code === "auth/invalid-email"
    ) {

      alert("Invalid email address.");

    } else {

      alert(error.message);

    }

  }

};



// ============================
// LOGOUT
// ============================

window.logoutUser = async function () {

  try {

    await signOut(auth);

    alert("You have been logged out.");

    window.location.href = "login.html";


  } catch (error) {

    console.error(error);

    alert("Logout failed.");

  }

};

// ============================
// LOAD USER DASHBOARD
// ============================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    return;
  }

  const welcomeText =
    document.getElementById("welcomeText");

  const walletBalance =
    document.getElementById("walletBalance");

  if (!welcomeText && !walletBalance) {
    return;
  }

  try {

    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      if (welcomeText) {
        welcomeText.textContent =
          "Welcome, " + (data.name || "User");
      }

      if (walletBalance) {

        const balance =
          Number(data.walletBalance || 0);

        walletBalance.textContent =
          "₦" + balance.toLocaleString("en-NG", {
            minimumFractionDigits: 2
          });
      }

    }

  } catch (error) {

    console.error(
      "Failed to load user:",
      error
    );

  }

});

// ============================
// LOAD PROFILE
// ============================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    return;
  }

  const profileName =
    document.getElementById("profileName");

  const nameValue =
    document.getElementById("nameValue");

  const emailValue =
    document.getElementById("emailValue");

  const profileBalance =
    document.getElementById("profileBalance");

  const referralCode =
    document.getElementById("referralCode");

  const referralLink =
    document.getElementById("referralLink");


  if (
    !profileName &&
    !nameValue &&
    !emailValue &&
    !profileBalance &&
    !referralCode
  ) {
    return;
  }


  try {

    const userSnap = await getDoc(
      doc(db, "users", user.uid)
    );


    if (!userSnap.exists()) {
      return;
    }


    const data = userSnap.data();


    if (profileName) {
      profileName.textContent =
        data.name || "User";
    }


    if (nameValue) {
      nameValue.textContent =
        data.name || "-";
    }


    if (emailValue) {
      emailValue.textContent =
        data.email || user.email || "-";
    }


    if (profileBalance) {

      const balance =
        Number(data.walletBalance || 0);

      profileBalance.textContent =
        "₦" +
        balance.toLocaleString("en-NG", {
          minimumFractionDigits: 2
        });
    }


    if (referralCode) {

      referralCode.textContent =
        data.referralCode || "-";
    }


    if (referralLink) {

      if (data.referralCode) {

        referralLink.textContent =
          window.location.origin +
          "/register.html?ref=" +
          data.referralCode;

      } else {

        referralLink.textContent =
          "-";
      }
    }


  } catch (error) {

    console.error(
      "Profile loading failed:",
      error
    );

  }

});


// ============================
// COPY REFERRAL CODE
// ============================

window.copyReferral = async function () {

  const element =
    document.getElementById("referralCode");

  if (!element) {
    return;
  }

  const code =
    element.textContent.trim();

  if (!code || code === "-") {
    return;
  }


  try {

    await navigator.clipboard.writeText(code);

    alert("Referral code copied!");

  } catch (error) {

    alert("Unable to copy referral code.");

  }

};

// ============================
// DATA PURCHASE
// ============================

window.buyData = function () {

  const network =
    document.getElementById("network").value;

  const phone =
    document.getElementById("phone").value.trim();

  const plan =
    document.getElementById("plan").value;


  if (!network || !phone || !plan) {

    alert(
      "Please select network, phone number and data plan."
    );

    return;
  }


  alert(
    "Data purchase system is ready.\n\n" +
    "Network: " + network + "\n" +
    "Phone: " + phone + "\n" +
    "Plan: " + plan
  );

};

window.buyAirtime = function () {

  const network =
    document.getElementById("airtimeNetwork").value;

  const phone =
    document.getElementById("airtimePhone").value.trim();

  const amount =
    document.getElementById("airtimeAmount").value;

  if (!network || !phone || !amount) {
    alert(
      "Please select network, enter phone number and amount."
    );
    return;
  }

  if (phone.length < 11) {
    alert("Please enter a valid phone number.");
    return;
  }

  if (Number(amount) < 50) {
    alert("Minimum airtime amount is ₦50.");
    return;
  }

  alert(
    "Airtime purchase system is ready.\n\n" +
    "Network: " + network + "\n" +
    "Phone: " + phone + "\n" +
    "Amount: ₦" + amount
  );

};

window.buyTV = function () {

  const provider =
    document.getElementById("tvProvider").value;

  const smartcard =
    document.getElementById("smartcard").value.trim();

  const plan =
    document.getElementById("tvPlan").value;

  if (!provider || !smartcard || !plan) {
    alert(
      "Please select provider, enter Smartcard/IUC number and plan."
    );
    return;
  }

  if (smartcard.length < 5) {
    alert("Please enter a valid Smartcard/IUC number.");
    return;
  }

  alert(
    "TV subscription system is ready.\n\n" +
    "Provider: " + provider + "\n" +
    "Smartcard/IUC: " + smartcard + "\n" +
    "Plan: " + plan
  );

};

window.payElectricity = function () {

  const disco =
    document.getElementById("disco").value;

  const meterNumber =
    document.getElementById("meterNumber").value.trim();

  const meterType =
    document.getElementById("meterType").value;

  const amount =
    document.getElementById("electricityAmount").value;

  if (!disco || !meterNumber || !meterType || !amount) {
    alert(
      "Please select provider, enter meter number, meter type and amount."
    );
    return;
  }

  if (meterNumber.length < 5) {
    alert("Please enter a valid meter number.");
    return;
  }

  if (Number(amount) < 100) {
    alert("Minimum electricity payment is ₦100.");
    return;
  }

  alert(
    "Electricity payment system is ready.\n\n" +
    "Provider: " + disco + "\n" +
    "Meter: " + meterNumber + "\n" +
    "Type: " + meterType + "\n" +
    "Amount: ₦" + amount
  );

};
