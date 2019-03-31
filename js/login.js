$(document).ready(function() {
  let emailCheck = false;
  let pinCheck = false;
  let passwordCheck = false;

  let token = localStorage.getItem("token");

  $("#email").on("blur", validateEmail);
  $("#pass").on("blur", validatePass);
  $("#pin").on("blur", validatePin);

  // Login

  $("#loginBtn").click(() => {
    if (!passwordCheck || !emailCheck || !pinCheck) {
      return;
    } else {
      const email = $("#email").val();
      const password = $("#pass").val();
      const pin = $("#pin").val();

      login(email, password, pin);
    }
  });

  function login(email, password, pin) {
    // ovo se automatski pretvara u JSON
    const data = {
      email: email,
      password: password,
      pin: pin
    };
    $.ajax({
      type: "POST",
      url: "https://reqres.in/api/login",
      data: data,
      success: success => {
        console.log(success);
        token = success.token;
        localStorage.setItem("token", token);
        location.assign("homepage.html");
      }
    });
  }

  $("#showPass").on("change", () => {
    this.checked
      ? $("#pass").attr("type", "text")
      : $("#pass").attr("type", "password");
  });

  $("#showPin").on("change", () => {
    this.checked
      ? $("#pin").attr("type", "text")
      : $("#pin").attr("type", "password");
  });

  function validateEmail() {
    const email = $("#email");
    re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

    if (!re.test(email.val())) {
      email.addClass("is-invalid");
      emailCheck = false;
    } else {
      email.removeClass("is-invalid");
      emailCheck = true;
    }
  }

  function validatePass() {
    const pass = $("#pass");
    re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,32}$/;

    if (!re.test(pass.val())) {
      pass.addClass("is-invalid");
      passwordCheck = false;
    } else {
      pass.removeClass("is-invalid");
      passwordCheck = true;
    }
  }

  function validatePin() {
    const pin = $("#pin");
    re = /^\d{4,8}\b$/;

    if (!re.test(pin.val())) {
      pin.addClass("is-invalid");
      pinCheck = false;
    } else {
      pin.removeClass("is-invalid");
      pinCheck = true;
    }
  }
});
