let selectedNumber = null;
let target = null;
let numbers = [];

// fetch game data
$.get("http://127.0.0.1:8000/api/game/start/", function (data) {
  target = data.target;
  numbers = data.numbers;

  $("#target").text(target);

  numbers.forEach(n => {
    $("#number-pool").append(`<div class="num">${n}</div>`);
  });
});

// number selection
$(document).on("click", ".num", function () {
  if ($(this).hasClass("used")) return;

  $(".num").removeClass("active");
  $(this).addClass("active");
  selectedNumber = $(this);
});

// place number
$(".slot").on("click", function () {
  // CASE 1: slot sudah berisi → UNDO
  if ($(this).text()) {
    const source = $(this).data("source");

    if (source) {
      source.removeClass("used");
    }

    $(this).text("");
    $(this).removeData("source");
    return;
  }

  // CASE 2: slot kosong + ada angka terpilih → PLACE
  if (!selectedNumber) return;

  $(this).text(selectedNumber.text());
  $(this).data("source", selectedNumber);
  selectedNumber.addClass("used").removeClass("active");
  selectedNumber = null;
});

// operator preset change
$("input[name='ops']").on("change", function () {
  const ops = $(this).data("ops").split("");

  $(".op").each(function (i) {
    $(this).text(ops[i]);
  });
});


// submit logic
$("#submit").on("click", function () {
  let values = [];
  $(".slot").each(function () {
    if (!$(this).text()) {
      $("#result").text("Semua slot harus diisi");
      return false;
    }
    values.push(parseInt($(this).text()));
  });

  const ops = $("input[name='ops']:checked").val().split("");

  let result = values[0];
  for (let i = 0; i < ops.length; i++) {
    switch (ops[i]) {
      case "+": result += values[i + 1]; break;
      case "-": result -= values[i + 1]; break;
      case "*": result *= values[i + 1]; break;
    }
  }

  const diff = Math.abs(target - result);

  if (diff <= 10 && result <= target) {
    $("#result").text(`BENAR! Hasil ${result}`);
  } else {
    $("#result").text(`SALAH. Hasil ${result}`);
  }
});
