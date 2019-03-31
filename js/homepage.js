$(document).ready(() => {
  let token = localStorage.getItem("token");
  let payments = [];
  let dateOfBirthSortingOrder;
  let paymentSortingOrder;

  if (!token) {
    location.assign("http://localhost:8080/login.html");
    return;
  }

  alert("Successufully log in!!");
  getPayments();

  function getPayments() {
    $.ajax({
      url: "http://localhost:8080/data/MOCK_DATA.json",
      type: "GET",
      data: {},
      success: (result, status, xhr) => {
        payments = result;
        printPayments();
      },
      error: () => {
        handleError("Error during reading payements from server");
      }
    });
  }

  function printPayments() {
    $("#payments tbody, #payments tfoot").empty();

    for (let i = 0; i < payments.length; i++) {
      let id = payments[i].id;
      let firstName = payments[i].first_name;
      let lastName = payments[i].last_name;
      let address = payments[i].address;
      let dateOfBirth = payments[i].date_of_birth;
      let payment = payments[i].payment;

      $("#payments tbody").append(`<tr id = 'payment${id}'></tr>`);
      $("#payment" + id).append(`<td>${id}</td>
                     <td>${firstName}</td>
                     <td>${lastName}</td>
                     <td data-type="address" contenteditable="false">${address}</td>
                     <td class="text-right">${dateOfBirth}</td>
                     <td data-type="payment" contenteditable="false" class="text-right">${payment
                       .slice(1)
                       .replace(/\d(?=(\d{3})+\,)/g, "$&.")} €</td>`);
    }

    $("#payments tfoot").append(`<tr class="font-weight-bold">
                                  <td colspan="4"></td>
                                  <td class="bg-primary text-right">Total:</td>
                                  <td id="total" class="bg-primary text-right">${sumPayments()}</td>
                                </tr>`);
    $("#payments").show();
  }

  // Sort date
  $("#date-of-birth").click(() => {
    $(".arrowBirth").toggleClass("down");

    if (!dateOfBirthSortingOrder || dateOfBirthSortingOrder === "DESC") {
      dateOfBirthSortingOrder = "ASC";
      payments.sort((p1, p2) => {
        const d1 = dateParse(p1);
        const d2 = dateParse(p2);
        return d1.getTime() - d2.getTime();
      });
    } else {
      dateOfBirthSortingOrder = "DESC";
      payments.sort((p1, p2) => {
        const d1 = dateParse(p1);
        const d2 = dateParse(p2);
        return d2.getTime() - d1.getTime();
      });
    }

    printPayments();
  });

  // Formatting date
  function dateParse(date) {
    const dateArray = date.date_of_birth.split("/");
    const day = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const year = parseInt(dateArray[2]);
    return new Date(year, month - 1, day);
  }

  // Sort payment
  $("#payment").click(() => {
    $(".arrowPayment").toggleClass("down");

    if (!paymentSortingOrder || paymentSortingOrder === "DESC") {
      paymentSortingOrder = "ASC";
      payments.sort((pay1, pay2) => {
        const p1 = parseFloat(pay1.payment.slice(1));
        const p2 = parseFloat(pay2.payment.slice(1));
        return p1 - p2;
      });
    } else {
      paymentSortingOrder = "DESC";
      payments.sort((pay1, pay2) => {
        const p1 = parseFloat(pay1.payment.slice(1));
        const p2 = parseFloat(pay2.payment.slice(1));
        return p2 - p1;
      });
    }

    printPayments();
  });

  function parseFloatValue(value) {
    return parseFloat(value.slice(1).replace(",", "."));
  }

  // Sum Total
  function sumPayments() {
    let total = 0;
    for (const payment of payments) {
      total += parseFloatValue(payment.payment);
    }

    return `${total
      .toFixed(2)
      .toString()
      .replace(".", ",")
      .replace(/\d(?=(\d{3})+\,)/g, "$&.")} €`;
  }

  // Search
  $("#search").on("keyup", () => {
    let value = $(this)
      .val()
      .toLowerCase();
    let filteredSum = 0;

    $("#payments tbody tr").filter(() => {
      let stayingInView =
        $(this)
          .text()
          .toLowerCase()
          .indexOf(value) > -1;
      $(this).toggle(stayingInView);

      if (stayingInView) {
        const id = parseInt(
          $(this)
            .attr("id")
            .slice(7)
        );

        for (const payment of payments) {
          if (payment.id === id) {
            filteredSum += parseFloatValue(payment.payment);
          }
        }
      }
    });

    $("#total").text(
      `${filteredSum
        .toFixed(2)
        .toString()
        .replace(".", ",")
        .replace(/\d(?=(\d{3})+\,)/g, "$&.")} €`
    );
  });

  // Contenteditable
  $("#payments").on("dblclick", "[contenteditable]", event => {
    // event.preventDefault();
    const target = $(event.target);
    const oldValue = target.text();

    target
      .attr("contenteditable", "true")
      .empty()
      .append(`<input type="text">`);

    target
      .children()
      .val(oldValue.slice(0, -2))
      .focus();

    let address = target.attr("data-type") === "address";
    target.children().on("blur", () => {
      let newValue = target.children().val();
      if ((isNaN(newValue) || newValue.length === 0) && !address) {
        alert("You must enter a valid number");
        newValue = oldValue;
      }

      const id = parseInt(
        target
          .parent()
          .attr("id")
          .slice(7)
      );
      for (const payment of payments) {
        if (payment.id === id) {
          if (address) {
            payment.address = newValue;
          } else {
            const numValue = newValue.split(" ")[0].replace(".", "");
            payment.payment = `€${numValue}`;
          }
        }
      }
      target.text(newValue);
      target.attr("contenteditable", "false");

      printPayments();
    });
  });
});
