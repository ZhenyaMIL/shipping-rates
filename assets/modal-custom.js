document.addEventListener('DOMContentLoaded', function () {

  let modal = document.querySelector(".calculate-shipping-rate__modal");
  let closeModal = document.getElementsByClassName("close")[0];
  let openModalButton = document.querySelector(".calculate-shipping-rate__open-modal");
  let calculateButton = document.querySelector('.calculate-button');
  let country, province, post_code;
  let inputs = document.querySelectorAll('.calculate-shipping-rate__modal__content p input');
  let resultValue = document.querySelector('span.display-rate__result__value');
  let wrapperBlock = document.querySelector('.display-rate');
  let domenName = window.location.protocol + "//" + window.location.host;


  openModalButton.onclick = function () {
    modal.classList.add('active');
  }

  inputs.forEach(input => {
    input.oninput = function() {
      let counter = 0;

      inputs.forEach(input => {
          if(input.value) {
            counter++;
          }
      })

      if(counter === inputs.length){
        calculateButton.classList.add('enable');
      } else {
        calculateButton.classList.remove('enable');
      }
    }
  })

  closeModal.onclick = function () {
    modal.classList.remove('active');
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove('active');
    }
  }

  calculateButton.addEventListener('click', () => {
    if(calculateButton.classList.contains("enable")){
      calculateButton.classList.add('active');

      country = document.querySelector('.calculate-shipping-rate__modal__content input[name="country"]').value.trim();
      province = document.querySelector('.calculate-shipping-rate__modal__content input[name="province"]').value.trim();
      post_code = document.querySelector('.calculate-shipping-rate__modal__content input[name="post_code"]').value.trim();

      saveCartItems();
    }
  });

  function saveCartItems() {
    fetch(`${domenName}/cart.js`, {
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

            sessionStorage.setItem(`variant-id-${variantId}`, `${quantity}`);
          });

          clearCart(nextStep = "addCurrentProduct");
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function clearCart(nextStep) {
    fetch(`${domenName}/cart/clear.js`, {
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

        if (nextStep === "clearAndShowValidation") {
          notCorrectData();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function addCurrentProduct() {
    let idValue = document.querySelector('.calculate-shipping-rate__modal__content .calculate-button').getAttribute('data-id');

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
        calculateRate(country, province, post_code);
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function calculateRate(country, province, post_code) {
    fetch(`${domenName}/cart/shipping_rates.json?shipping_address%5Bzip%5D=${post_code}&shipping_address%5Bcountry%5D=${country}&shipping_address%5Bprovince%5D=${province}`, {
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
        clearCart("clearAndShowValidation")
      });
  }

  function returnCartState() {
    let productsData = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      let productData;
      let key = sessionStorage.key(i);
      let productKey = key.includes('variant-id-');

      if(productKey) {
        let transformKey = key.split('variant-id-')[1];

        productData = {
          'id': transformKey,
          'quantity': sessionStorage.getItem(key)
        };

        productsData.push(productData);
      }
    }

    let formData = {
      'items': productsData
    };

    let itemsExist = formData.items.length ? true : false;

    if(itemsExist) {
      fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        calculateButton.classList.remove('active');

        validate(true);

        sessionStorage.clear();
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    } else {
      calculateButton.classList.remove('active');

      validate(true);
    }
  }

  function notCorrectData() {
    calculateButton.classList.remove('active');
    wrapperBlock.classList.remove('active');
    resultValue.innerHTML = '';

    validate(false);
  }

  function validate(value) {
    if(value === true) {
      inputs.forEach(input => {
        input.classList.remove('no-valid');
      })
    } else {
      inputs.forEach(input => {
        input.classList.add('no-valid');
      })
    }
  }
});