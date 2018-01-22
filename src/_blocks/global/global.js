if (document.querySelector("#menu")) {
  document.body.addEventListener("menuChange", function(e) {
    if (e.detail.opened) {
      document.body.classList.add("body-popup");
    } else {
      document.body.classList.remove("body-popup");
    }
  });
}

// if (getComputedStyle(document.querySelector(".header")).position == "fixed") {
//   function bodyPaddingTop() {
//     document.body.style.paddingTop = document.querySelector(".header").offsetHeight + "px";
//   }

//   bodyPaddingTop();

//   window.addEventListener("resize", bodyPaddingTop);
// }