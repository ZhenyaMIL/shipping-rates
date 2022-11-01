document.addEventListener('DOMContentLoaded', function () {

  let modal = document.querySelector(".recognize-shipping-rate__modal");
  let btn = document.querySelector(".recognize-shipping-rate__button");
  let closeButton = document.getElementsByClassName("close")[0];

  btn.onclick = function () {
    modal.style.display = "block";
  }

  closeButton.onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});