import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "./firebase.js";


// ============================
// REGISTER
// ============================

window.registerUser = async function () {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const referral = document.getElementById("referral").value.trim();

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

    console.log("Account created:", userCredential.user.uid);

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
