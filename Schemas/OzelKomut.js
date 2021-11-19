const mongoose = require("mongoose");

const schema = new mongoose.Schema({
      Isim: String,
      Alternatifler: Array,
      Prefix: Boolean,
      Tur: String,
      Hedef: Number,
      Karaliste: Array,
      Parametreler: {
        Gonderilecek_Mesaj: String,
        Alinacak_Roller: Array,
        Verilecek_Roller: Array,
        Ozel_Kod: String
      },
      Yetki: {
        Kisiler: Array,
        Roller: Array,
        Izinler: Array
      }
});

const model = mongoose.model("OzelKomut", schema);

module.exports.model = model;
module.exports.schema = schema;