document.addEventListener("DOMContentLoaded", function () {
  console.log("RC DATA started successfully");

  const app = document.querySelector(".app");

  if (app) {
    app.classList.add("loaded");
  }
});
