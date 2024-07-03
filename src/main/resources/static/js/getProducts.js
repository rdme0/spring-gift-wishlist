function addProductRow(element) {
  const table = document.getElementById('productTable').getElementsByTagName(
      'tbody')[0];
  const newRow = table.insertRow();

  const newIdCell = newRow.insertCell(0);
  const productNameCell = newRow.insertCell(1);
  const productPriceCell = newRow.insertCell(2);
  const productImageCell = newRow.insertCell(3);
  const saveCell = newRow.insertCell(4);
  const cancelCell = newRow.insertCell(5);

  productNameCell.innerHTML = '<input type="text" id="productName" oninput="validate()"> <span class="nameMessage"></span>';
  productPriceCell.innerHTML = '<input type="text" id="productPrice" oninput="validate()"> <span class="priceMessage"></span>';
  productImageCell.innerHTML = '<input type="text" id="productImage">';
  saveCell.innerHTML = '<img src="/image/save.png" alt="save" id="saveButton" style="width:100px;height: auto" onclick="saveAddProduct(this)">';
  cancelCell.innerHTML = '<img src="/image/cancel.png" alt="cancel" style="width:100px;height: auto" onclick="cancelProductEditing(this)">';

  element.style.pointerEvents = 'none';
  element.style.opacity = '0.3';
}

function validateName(element) {
  const inputName = element.value;
  const inputMessage = element.nextElementSibling;
  const pattern1 = /^[a-zA-Z0-9ㄱ-ㅎ가-힣()\[\]+\-&/_ ]+$/;
  const pattern2 = /^((?!카카오).)*$/;

  if (inputName.length === 0) {
    return false;
  } else if (inputName.length < 1 || inputName.length > 15) {
    inputMessage.textContent = "제품명 길이는 1~15자만 가능합니다.";
    inputMessage.style.color = "red";
    return false;
  } else if (pattern1.test(inputName) && pattern2.test(inputName)) {
    inputMessage.textContent = "올바른 이름입니다.";
    inputMessage.style.color = "green";
    return true
  } else if (pattern1.test(inputName) && !pattern2.test(inputName)) {
    inputMessage.textContent = "카카오가 포함된 문구는 담당 MD와 협의한 후에 사용해주시기 바랍니다.";
    inputMessage.style.color = "red";
    return false
  }
  inputMessage.textContent = "( ), [ ], +, -, &, /, _을 제외한 특수문자는 입력할 수 없습니다.";
  inputMessage.style.color = "red";
  return false
}

function validatePrice(element) {
  const inputPrice = element.value;
  const inputMessage = element.nextElementSibling;

  if (inputPrice.length === 0) {
    return false;
  } else if (isNaN(inputPrice)) {
    inputMessage.textContent = "가격을 숫자로 입력해주세요";
    inputMessage.style.color = "red";
    return false
  } else if (inputPrice.length < 0 || inputPrice > 2147483647) {
    inputMessage.textContent = "가격은 0~2147483647원 까지만 가능합니다.";
    inputMessage.style.color = "red";
    return false
  }
  inputMessage.textContent = "올바른 가격입니다.";
  inputMessage.style.color = "green";
  return true
}

function validate() {
  const productName = document.getElementById('productName');
  const productPrice = document.getElementById('productPrice');
  const saveButton = document.getElementById('saveButton');

  if (validateName(productName) && validatePrice(productPrice)) {
    saveButton.style.pointerEvents = 'auto';
    saveButton.style.opacity = '1';
  } else {
    saveButton.style.pointerEvents = 'none';
    saveButton.style.opacity = '0.3';
  }
}

function saveAddProduct() {
  const productName = document.getElementById('productName').value;
  const productPrice = document.getElementById('productPrice').value;
  const productImage = document.getElementById('productImage').value;

  let requestJson = {
    "name": productName,
    "price": productPrice,
    "imageUrl": productImage
  };

  $.ajax({
    type: 'POST',
    url: '/api/products',
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(requestJson),
    success: function () {
      alert('상품 추가를 성공하였습니다.');
      window.location.href = '/api/products';
    },
    error: function (xhr) {
      if (xhr.responseJSON && xhr.responseJSON.isError
          && xhr.responseJSON.message) {
        alert('오류: ' + xhr.responseJSON.message);
      } else {
        alert('상품 추가를 실패하였습니다. 값을 제대로 입력했는지 확인해주세요');
      }
    }
  });
}

function cancelProductEditing() {
  const table = document.getElementById('productTable').getElementsByTagName(
      'tbody')[0];
  table.deleteRow(table.rows.length - 1);

  const addButton = document.getElementById('addButton');
  addButton.style.pointerEvents = 'auto';
  addButton.style.opacity = '1';
}

function removeProductRow(button) {
  const row = button.closest('tr');
  const productId = row.getAttribute('data-id');

  $.ajax({
    type: 'DELETE',
    url: `/api/products/${productId}`,
    contentType: 'application/json; charset=utf-8',
    success: function () {
      alert('상품 삭제를 성공하였습니다.');
      window.location.href = '/api/products';
    },
    error: function (xhr) {
      if (xhr.responseJSON && xhr.responseJSON.isError
          && xhr.responseJSON.message) {
        alert('오류: ' + xhr.responseJSON.message);
      } else {
        alert('상품 삭제를 실패하였습니다.');
      }
      window.location.href = '/api/products';
    }
  });
}

function editProductRow(button) {
  const row = button.closest('tr');

  const nameCell = row.querySelector('.productName');
  const priceCell = row.querySelector('.productPrice');
  const imageCell = row.querySelector('.productImage');

  const currentName = nameCell.innerText;
  const currentPrice = priceCell.innerText;
  const currentImage = imageCell.querySelector('img').src;

  nameCell.innerHTML = `<input type="text" id="productName" value="${currentName}" oninput="validateName(this)"> <span class="nameMessage"></span>`;
  priceCell.innerHTML = `<input type="text" id="productPrice" value="${currentPrice}" oninput="validatePrice(this)"> <span class="priceMessage"></span>`;
  imageCell.innerHTML = `<input type="text" id="productImage" value="${currentImage}">`;

  button.setAttribute('src', '/image/save.png');
  button.setAttribute('alt', 'save');
  button.setAttribute('onclick', 'savePutProductRow(this)');
}

function savePutProductRow(button) {
  const row = button.closest('tr');
  const productId = row.getAttribute('data-id');
  const productName = row.querySelector('.productName').value;
  const productPrice = row.querySelector('.productPrice').value;
  const productImage = row.querySelector('.productImage').value;

  let requestJson = {
    "id": productId,
    "name": productName,
    "price": productPrice,
    "imageUrl": productImage
  };

  $.ajax({
    type: 'PUT',
    url: `/api/products/${productId}`,
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(requestJson),
    success: function () {
      alert('상품 수정을 성공하였습니다.');
      window.location.href = '/api/products';
    },
    error: function (xhr) {
      if (xhr.responseJSON && xhr.responseJSON.isError
          && xhr.responseJSON.message) {
        alert('오류: ' + xhr.responseJSON.message);
      } else {
        alert('상품 수정을 실패하였습니다. 값을 제대로 입력했는지 확인해주세요');
      }
    }
  });
}