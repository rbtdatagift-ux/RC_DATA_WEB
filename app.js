import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// ================================
// AUTH PROTECTION
// ================================

const publicPages = [
  "login.html",
  "register.html"
];

const currentPage =
  window.location.pathname.split("/").pop() || "index.html";


// ================================
// REGISTER
// ================================

window.registerUser = async function () {

  const name =
    document.getElementById("name")?.value.trim();

  const email =
    document.getElementById("email")?.value.trim();

  const password =
    document.getElementById("password")?.value;

  const referral =
    document.getElementById("referral")?.value.trim();


  if (!name || !email || !password) {
    alert("Please fill all required fields.");
    return;
  }


  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }


  try {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      result.user;


    const referralCode =
      "RC" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


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


    alert("Account created successfully.");

    window.location.href = "index.html";


  } catch (error) {

    console.error(error);

    alert(error.message);

  }

};


// ================================
// LOGIN
// ================================

window.loginUser = async function () {

  const email =
    document.getElementById("email")?.value.trim();

  const password =
    document.getElementById("password")?.value;


  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    alert("Login successful.");

    window.location.href = "index.html";


  } catch (error) {

    console.error(error);

    alert("Login failed: " + error.message);

  }

};


// ================================
// LOGOUT
// ================================

window.logoutUser = async function () {

  try {

    await signOut(auth);

    window.location.href = "login.html";

  } catch (error) {

    console.error(error);

    alert("Unable to logout.");

  }

};


// ================================
// DASHBOARD
// ================================

async function loadDashboard(user) {

  const welcomeText =
    document.getElementById("welcomeText");

  const walletBalance =
    document.getElementById("walletBalance");


  if (!welcomeText && !walletBalance) {
    return;
  }


  try {

    const userDoc =
      await getDoc(
        doc(db, "users", user.uid)
      );


    if (!userDoc.exists()) {
      return;
    }


    const data =
      userDoc.data();


    if (welcomeText) {

      welcomeText.textContent =
        "Welcome, " + (data.name || "User");

    }


    if (walletBalance) {

      walletBalance.textContent =
        "₦" +
        Number(
          data.walletBalance || 0
        ).toLocaleString(
          "en-NG",
          {
            minimumFractionDigits: 2
          }
        );

    }

  } catch (error) {

    console.error(error);

  }

}


// ================================
// PROFILE
// ================================

async function loadProfile(user) {

  const profileName =
    document.getElementById("profileName");


  if (!profileName) {
    return;
  }


  try {

    const userDoc =
      await getDoc(
        doc(db, "users", user.uid)
      );


    if (!userDoc.exists()) {
      return;
    }


    const data =
      userDoc.data();


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


    profileName.textContent =
      data.name || "User";


    if (nameValue) {
      nameValue.textContent =
        data.name || "-";
    }


    if (emailValue) {
      emailValue.textContent =
        data.email || user.email || "-";
    }


    if (profileBalance) {

      profileBalance.textContent =
        "₦" +
        Number(
          data.walletBalance || 0
        ).toLocaleString(
          "en-NG",
          {
            minimumFractionDigits: 2
          }
        );

    }


    if (referralCode) {

      referralCode.textContent =
        data.referralCode || "-";

    }


    if (referralLink) {

      referralLink.textContent =
        window.location.origin +
        "/register.html?ref=" +
        (data.referralCode || "");

    }

  } catch (error) {

    console.error(error);

  }

}


// ================================
// COPY REFERRAL
// ================================

window.copyReferral = async function () {

  const referralCode =
    document.getElementById("referralCode")?.textContent;


  if (!referralCode || referralCode === "-") {
    return;
  }


  try {

    await navigator.clipboard.writeText(
      referralCode
    );

    alert("Referral code copied.");

  } catch (error) {

    alert("Unable to copy referral code.");

  }

};


// ================================
// DATA
// ================================

window.buyData = function () {

  const network =
    document.getElementById("network")?.value;

  const phone =
    document.getElementById("phone")?.value.trim();

  const plan =
    document.getElementById("plan")?.value;


  if (!network || !phone || !plan) {

    alert(
      "Please select network, phone number and data plan."
    );

    return;
  }


  if (phone.length < 11) {

    alert("Please enter a valid phone number.");

    return;
  }


  alert(
    "Data purchase system is ready.\n\n" +
    "Network: " + network + "\n" +
    "Phone: " + phone + "\n" +
    "Plan: " + plan
  );

};


// ================================
// AIRTIME
// ================================

window.buyAirtime = function () {

  const network =
    document.getElementById("airtimeNetwork")?.value;

  const phone =
    document.getElementById("airtimePhone")?.value.trim();

  const amount =
    document.getElementById("airtimeAmount")?.value;


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


// ================================
// TV
// ================================

window.buyTV = function () {

  const provider =
    document.getElementById("tvProvider")?.value;

  const smartcard =
    document.getElementById("smartcard")?.value.trim();

  const plan =
    document.getElementById("tvPlan")?.value;


  if (!provider || !smartcard || !plan) {

    alert(
      "Please select provider, enter Smartcard/IUC number and plan."
    );

    return;
  }


  if (smartcard.length < 5) {

    alert(
      "Please enter a valid Smartcard/IUC number."
    );

    return;
  }


  alert(
    "TV subscription system is ready.\n\n" +
    "Provider: " + provider + "\n" +
    "Smartcard/IUC: " + smartcard + "\n" +
    "Plan: " + plan
  );

};


// ================================
// ELECTRICITY
// ================================

window.payElectricity = function () {

  const disco =
    document.getElementById("disco")?.value;

  const meterNumber =
    document.getElementById("meterNumber")?.value.trim();

  const meterType =
    document.getElementById("meterType")?.value;

  const amount =
    document.getElementById("electricityAmount")?.value;


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


// ================================
// HISTORY
// ================================

async function loadHistory(user) {

  const historyList =
    document.getElementById("historyList");


  if (!historyList) {
    return;
  }


  try {

    const transactionsRef =
      collection(db, "transactions");


    const q =
      query(
        transactionsRef,
        where("userId", "==", user.uid)
      );


    const snapshot =
      await getDocs(q);


    if (snapshot.empty) {

      historyList.innerHTML = `
        <div class="card">
          <p>No transactions yet.</p>
        </div>
      `;

      return;
    }


    historyList.innerHTML = "";


    snapshot.forEach((item) => {

      const data =
        item.data();


      const card =
        document.createElement("div");


      card.className = "card";


      card.innerHTML = `
        <h3>${data.type || "Transaction"}</h3>

        <p>
          Amount:
          ₦${Number(data.amount || 0).toLocaleString()}
        </p>

        <p>
          Status:
          ${data.status || "Pending"}
        </p>
      `;


      historyList.appendChild(card);

    });


  } catch (error) {

    console.error(error);


    historyList.innerHTML = `
      <div class="card">
        <p>Unable to load transaction history.</p>
      </div>
    `;

  }

}


// ================================
// AUTH STATE
// ================================

onAuthStateChanged(auth, async (user) => {

  const isPublicPage =
    publicPages.includes(currentPage);


  if (!user) {

    if (!isPublicPage) {

      window.location.href =
        "login.html";

    }

    return;
  }


  // Logged-in user on login/register
  if (isPublicPage) {

    window.location.href =
      "index.html";

    return;
  }


  await loadDashboard(user);

  await loadProfile(user);

  await loadHistory(user);

});

// ================================
// FUND WALLET
// ================================

window.fundWallet = function () {

  const amount =
    document.getElementById("fundAmount")?.value;

  if (!amount) {
    alert("Please enter an amount.");
    return;
  }

  if (Number(amount) < 100) {
    alert("Minimum funding amount is ₦100.");
    return;
  }

  alert(
    "Payment gateway is ready to be connected.\n\n" +
    "Amount: ₦" + Number(amount).toLocaleString()
  );

};
