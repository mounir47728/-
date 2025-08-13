const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const { PrayerTimes, Coordinates, CalculationMethod, Madhab } = require('adhan');

const app = express();
app.use(cors());

const wilayas = {
  // الولايات القديمة
  "adrar": { name: "أدرار", lat: 27.8742, lng: -0.2939 },
  "chlef": { name: "الشلف", lat: 36.1653, lng: 1.3345 },
  "laghouat": { name: "الأغواط", lat: 33.4810, lng: 2.5230 },
  "oum-el-bouaghi": { name: "أم البواقي", lat: 35.8754, lng: 7.1135 },
  "batna": { name: "باتنة", lat: 35.5550, lng: 6.1741 },
  "bejaia": { name: "بجاية", lat: 36.7559, lng: 5.0843 },
  "biskra": { name: "بسكرة", lat: 34.8504, lng: 5.7280 },
  "bechar": { name: "بشار", lat: 31.6167, lng: -2.2167 },
  "blida": { name: "البليدة", lat: 36.4701, lng: 2.8277 },
  "bouira": { name: "البويرة", lat: 36.3805, lng: 3.9014 },
  "tamanrasset": { name: "تمنراست", lat: 22.7850, lng: 5.5228 },
  "tebessa": { name: "تبسة", lat: 35.4042, lng: 8.1240 },
  "tlemcen": { name: "تلمسان", lat: 34.8783, lng: -1.3150 },
  "tiaret": { name: "تيارت", lat: 35.3710, lng: 1.3169 },
  "tizi-ouzou": { name: "تيزي وزو", lat: 36.7118, lng: 4.0459 },
  "algiers": { name: "الجزائر العاصمة", lat: 36.7528, lng: 3.042 },
  "djelfa": { name: "الجلفة", lat: 34.6728, lng: 3.2630 },
  "jijel": { name: "جيجل", lat: 36.8206, lng: 5.7667 },
  "setif": { name: "سطيف", lat: 36.1911, lng: 5.4137 },
  "saida": { name: "سعيدة", lat: 34.8303, lng: 0.1517 },
  "skikda": { name: "سكيكدة", lat: 36.8796, lng: 6.9063 },
  "sidi-bel-abbes": { name: "سيدي بلعباس", lat: 35.1899, lng: -0.6309 },
  "annaba": { name: "عنابة", lat: 36.9020, lng: 7.7550 },
  "guelma": { name: "قالمة", lat: 36.4620, lng: 7.4333 },
  "constantine": { name: "قسنطينة", lat: 36.3650, lng: 6.6147 },
  "medea": { name: "المدية", lat: 36.2653, lng: 2.7670 },
  "mostaganem": { name: "مستغانم", lat: 35.9311, lng: 0.0899 },
  "msila": { name: "المسيلة", lat: 35.7058, lng: 4.5418 },
  "mascara": { name: "معسكر", lat: 35.3941, lng: 0.1380 },
  "ouargla": { name: "ورقلة", lat: 31.9500, lng: 5.3167 },
  "oran": { name: "وهران", lat: 35.6971, lng: -0.6308 },
  "el-bayadh": { name: "البيض", lat: 33.6832, lng: 1.0193 },
  "illizi": { name: "إليزي", lat: 26.4833, lng: 8.4667 },
  "bordj-bou-arreridj": { name: "برج بوعريريج", lat: 36.0730, lng: 4.7610 },
  "boumerdes": { name: "بومرداس", lat: 36.7664, lng: 3.4772 },
  "el-tarf": { name: "الطارف", lat: 36.7670, lng: 8.3136 },
  "tindouf": { name: "تندوف", lat: 27.6742, lng: -8.1474 },
  "tissemsilt": { name: "تيسمسيلت", lat: 35.6072, lng: 1.8100 },
  "el-oued": { name: "الوادي", lat: 33.3700, lng: 6.8670 },
  "khenchela": { name: "خنشلة", lat: 35.4358, lng: 7.1433 },
  "souk-ahras": { name: "سوق أهراس", lat: 36.2864, lng: 7.9511 },
  "tipaza": { name: "تيبازة", lat: 36.5897, lng: 2.4477 },
  "mila": { name: "ميلة", lat: 36.4500, lng: 6.2667 },
  "ain-defla": { name: "عين الدفلى", lat: 36.2641, lng: 1.9679 },
  "naama": { name: "النعامة", lat: 33.2667, lng: -0.3167 },
  "ain-temouchent": { name: "عين تموشنت", lat: 35.3024, lng: -1.1404 },
  "ghardaia": { name: "غرداية", lat: 32.4900, lng: 3.6700 },

  // الولايات الجديدة (2019)
  "timimoun": { name: "تيميمون", lat: 29.2639, lng: 0.2300 },
  "bordj-baji-mokhtar": { name: "برج باجي مختار", lat: 21.3271, lng: 0.9499 },
  "ouled-djellal": { name: "أولاد جلال", lat: 34.4186, lng: 4.9619 },
  "beni-abbes": { name: "بني عباس", lat: 30.0833, lng: -2.1667 },
  "in-salah": { name: "عين صالح", lat: 27.1930, lng: 2.4600 },
  "in-guezzam": { name: "عين قزام", lat: 19.5736, lng: 5.7750 },
  "touggourt": { name: "تقرت", lat: 33.1053, lng: 6.0650 },
  "djanet": { name: "جانت", lat: 24.5525, lng: 9.4820 },
  "el-mghair": { name: "المغير", lat: 33.9500, lng: 5.9333 },
  "el-menouar": { name: "المنيعة", lat: 32.2500, lng: 2.9833 }
};


function formatDZ(d) {
  // adhan يعطي Date في UTC -> نحوّله إلى توقيت الجزائر (يحترم التوقيت الصيفي إن وُجد)
  return moment.utc(d).tz('Africa/Algiers').locale('ar').format('HH:mm'); // مثال: "05:32 ص"
}

app.get('/api/pray', (req, res) => {
  const city = req.query.city;
  const dateStr = req.query.date;

  if (!city || !wilayas[city]) {
    return res.status(400).json({ error: 'يرجى اختيار ولاية صحيحة' });
  }

  const { lat, lng } = wilayas[city];
  // استخدم تاريخ اليوم إن لم يُحدد
  const date = dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date();

  const coords = new Coordinates(lat, lng);

  // طريقة الحساب: اختر واحدة مناسبة للجزائر
  const params = CalculationMethod.UmmAlQura();
  params.fajrAngle = 18;  // زاوية الفجر
  params.ishaAngle = 17;  // زاوية العشاء
  params.adjustments = {
  fajr: 1,    // تقديم الفجر بدقيقتين
  dhuhr: 0,
  asr: 2,
  maghrib: 3,
  isha: 0
};

; // أو CalculationMethod.UmmAlQura()
  params.madhab = Madhab.Shafi; // تأثير على وقت العصر (Shafi/standard عادة مناسب للجزائر)

  // إضافي: لو تريد تعديل بسيط لتوافق الجهة الرسمية يمكن وضع دقائق هنا
  // مثال: يجعل الفجر يتقدم بدقيقتين:
  // params.adjustments = { fajr: 2, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

  const times = new PrayerTimes(coords, date, params);

  // لِلتصحيح/تتبُّع: اطبع القيم الخام (UTC) في اللوغ لو تحتاج مقارنة
  console.log('DEBUG raw UTC times:', {
    fajr: times.fajr.toISOString(),
    sunrise: times.sunrise.toISOString(),
    dhuhr: times.dhuhr.toISOString(),
    asr: times.asr.toISOString(),
    maghrib: times.maghrib.toISOString(),
    isha: times.isha.toISOString()
  });

  res.json({
    الولاية: wilayas[city].name,
    التاريخ: moment.utc(date).tz('Africa/Algiers').format('YYYY-MM-DD'),
    الفجر: formatDZ(times.fajr),
    الشروق: formatDZ(times.sunrise),
    الظهر: formatDZ(times.dhuhr),
    العصر: formatDZ(times.asr),
    المغرب: formatDZ(times.maghrib),
    العشاء: formatDZ(times.isha)
  });
});

app.listen(3000, () => {
  console.log('✅ API تعمل على http://localhost:3000');
});
