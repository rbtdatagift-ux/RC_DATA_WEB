import {
  auth,
  db,
  doc,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "./firebase.js";


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
