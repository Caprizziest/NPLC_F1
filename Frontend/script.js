// --- DATABASE PRESET OPERATOR ---
const PRESETS = {
  'p1': ['*', '*', '+'],
  'p2': ['+', '*', '+'],
  'p3': ['+', '+', '*'],
  'p4': ['*', '+', '-'],
  'p5': ['*', '-', '*'],
  'p6': ['*', '+', '*'],
  'p7': ['*', '-', '-'],
  'p8': ['-', '+', '*']
};

let selectedNumber = null;
let target = null;
let numbers = [];

// --- 1. SETUP GAME ---
$.get("http://127.0.0.1:8000/api/game/start/", function (data) {
  target = data.target;
  numbers = data.numbers;

  $("#target").text(target);
  $("#number-pool").empty(); // Reset pool jika restart

  numbers.forEach(n => {
    $("#number-pool").append(`<div class="num">${n}</div>`);
  });
});

// --- 2. LOGIKA PILIH ANGKA ---
$(document).on("click", ".num", function () {
  if ($(this).hasClass("used")) return;

  $(".num").removeClass("active");
  $(this).addClass("active");
  selectedNumber = $(this);
});

// --- 3. LOGIKA TARUH ANGKA ---
$(".slot").on("click", function () {
  // Undo (Kosongkan slot)
  if ($(this).text()) {
    const source = $(this).data("source");
    if (source) source.removeClass("used");
    $(this).text("");
    $(this).removeData("source");
    return;
  }

  // Place (Taruh angka)
  if (!selectedNumber) return;
  $(this).text(selectedNumber.text());
  $(this).data("source", selectedNumber);
  selectedNumber.addClass("used").removeClass("active");
  selectedNumber = null;
});

// --- 4. LOGIKA GANTI PRESET (UPDATE TAMPILAN) ---
$("input[name='ops']").on("change", function () {
  const key = $(this).val(); // Ambil value (p1, p2, dst)
  const ops = PRESETS[key];  // Ambil array operator dari variable JS

  if (!ops) return;

  // Update tampilan di antara kotak angka
  $(".op").each(function (i) {
    if (ops[i]) {
      // Tampilkan simbol cantik (x) tapi logika tetap (*)
      $(this).text(ops[i].replace("*", "×"));
    }
  });
});

// --- 5. LOGIKA SUBMIT ---
$("#submit").on("click", function () {
  // A. Ambil Angka dari Slot
  let values = [];
  let allSlotsFilled = true;
  
  $(".slot").each(function () {
    const txt = $(this).text();
    if (!txt) {
      allSlotsFilled = false;
      return false;
    }
    values.push(parseInt(txt));
  });

  if (!allSlotsFilled) {
    $("#result").text("Semua slot angka harus diisi!");
    return;
  }

  // B. Ambil Operator dari JS berdasarkan Pilihan User
  const selectedKey = $("input[name='ops']:checked").val();
  
  if (!selectedKey) {
    $("#result").text("Pilih pola operator dulu!");
    return;
  }

  const ops = PRESETS[selectedKey]; // Ambil operator asli: ['*', '*', '+']

  // C. Hitung Rumus (Pakai String agar sesuai PEMDAS)
  // Contoh: "4"
  let formulaStr = values[0].toString();
  
  // Loop: tambah operator dan angka berikutnya
  // Hasil string: "4*3*9+5"
  for (let i = 0; i < ops.length; i++) {
    formulaStr += ops[i] + values[i + 1];
  }

  // D. Eksekusi Hitungan
  let result = 0;
  try {
    // new Function return ... lebih aman & cepat dibanding eval()
    result = new Function('return ' + formulaStr)();
  } catch (e) {
    $("#result").text("Error menghitung rumus");
    return;
  }

  // E. Cek Jawaban
  const minAllowed = target - 10;
  const maxAllowed = target + 10;
  const displayFormula = formulaStr.replaceAll("*", "×"); // Untuk display saja

  if (result >= minAllowed && result <= maxAllowed) {
    $("#result").html(`
      <div style="color: green; font-weight: bold; font-size: 1.2em;">BENAR!</div>
      Rumus: ${displayFormula} = <strong>${result}</strong><br>
      Target: ${target} (Range: ${minAllowed} - ${maxAllowed})
    `);
  } else {
    $("#result").html(`
      <div style="color: red; font-weight: bold; font-size: 1.2em;">SALAH!</div>
      Rumus: ${displayFormula} = <strong>${result}</strong><br>
      Target: ${target} (Range: ${minAllowed} - ${maxAllowed})
    `);
  }
});