document.addEventListener('DOMContentLoaded', function () {

  let modal = document.querySelector(".recognize-shipping-rate__modal");
  let closeModal = document.getElementsByClassName("close")[0];
  let openModalButton = document.querySelector(".recognize-shipping-rate__button");
  let recognizeButton = document.querySelector('.submit-button');
  let country, province, post_code;
  let preloader = document.querySelector('.recognize-shipping-rate__modal__content .preloader');
  let buttonTitle = document.querySelector('.recognize-shipping-rate__modal__content .submit-button p');
  let inputs = document.querySelectorAll('.recognize-shipping-rate__modal__content p input');

  openModalButton.onclick = function () {
    modal.style.display = "block";
  }

  closeModal.onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  recognizeButton.addEventListener('click', () => {
    recognizeButton.classList.add('active');

    country = document.querySelector('.recognize-shipping-rate__modal__content input[name="country"]').value.trim();
    province = document.querySelector('.recognize-shipping-rate__modal__content input[name="province"]').value.trim();
    post_code = document.querySelector('.recognize-shipping-rate__modal__content input[name="post_code"]').value.trim();

    preloader.classList.add('active');
    buttonTitle.classList.remove('active');

    saveCartItems();
  });

  function saveCartItems() {
    fetch(`https://ttttssedfwsdef.myshopify.com/cart.js`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify()
      })
      .then(response => response.json())
      .then((response) => {
        if (response) {
          let allProduct = response.items;

          allProduct.forEach(product => {
            let variantId = product.variant_id;
            let quantity = product.quantity;

            sessionStorage.setItem(`${variantId}`, `${quantity}`);
          });

          clearCart(nextStep = "addCurrentProduct");
        }
      })
  }

  function clearCart(nextStep) {
    fetch(`https://ttttssedfwsdef.myshopify.com/cart/clear.js`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify()
      })
      .then(() => {
        if (nextStep === "addCurrentProduct") {
          addCurrentProduct();
        }

        if (nextStep === "returnCartState") {
          returnCartState();
        }
      })
  }

  function addCurrentProduct() {
    let idValue = document.querySelector('.recognize-shipping-rate__modal__content .submit-button').getAttribute('data-id');

    let formData = {
      'items': [{
        'id': idValue,
        'quantity': 1
      }]
    };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        recognizeRate(country, province, post_code);
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function recognizeRate(country, province, post_code) {
    let resultValue = document.querySelector('span.display-rate__result__value');
    let wrapperBlock = document.querySelector('.display-rate');

    fetch(`https://ttttssedfwsdef.myshopify.com/cart/shipping_rates.json?shipping_address%5Bzip%5D=${post_code}&shipping_address%5Bcountry%5D=${country}&shipping_address%5Bprovince%5D=${province}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify()
      })
      .then(response => response.json())
      .then((response) => {
        if (response) {
          let price = response.shipping_rates[0].price;
          let currency = response.shipping_rates[0].currency;

          wrapperBlock.classList.add('active');
          resultValue.innerHTML = `${price} ${currency}`;

          clearCart(nextStep = "returnCartState");
        }
      })
      .catch(() => {
        notCorrectData();
      });
  }

  function returnCartState() {
    let productsData = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      let productData;
      let key = sessionStorage.key(i);

      productData = {
        'id': key,
        'quantity': sessionStorage.getItem(key)
      };

      productsData.push(productData);
    }

    let formData = {
      'items': productsData
    };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        preloader.classList.remove('active');
        buttonTitle.classList.add('active');
        recognizeButton.classList.remove('active');

        inputs.forEach(input => {
          input.classList.remove('no-valid');
        })

        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function notCorrectData() {
    preloader.classList.remove('active');
    buttonTitle.classList.add('active');

    inputs.forEach(input => {
      input.classList.add('no-valid');
    })
  }
});