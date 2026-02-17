// ===============================
// 地理系お助けサイト 完全版
// 地図再表示バグ修正版
// ===============================

// ===== 日本語正規化 =====
function normalizeText(text) {
  return text.toLowerCase().replace(/[ぁ-ん]/g, s =>
    String.fromCharCode(s.charCodeAt(0) + 0x60)
  );
}

// ===============================
// 日本47都道府県
// ===============================
const japanPrefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

// ===============================
// ランダム都道府県
// ===============================
function randomPrefecture() {
  removeMap();
  const random = japanPrefectures[Math.floor(Math.random() * japanPrefectures.length)];
  document.getElementById("result").innerHTML = `<h2>${random}</h2>`;
}

// ===============================
// ランダム国
// ===============================
async function randomCountry() {
  removeMap();
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,translations,area,population,currencies,flags,independent"
    );
    if (!res.ok) throw new Error("API取得失敗");
    const data = await res.json();

    const independentCountries = data.filter(c => c.independent);
    const country = independentCountries[Math.floor(Math.random() * independentCountries.length)];
    displayCountry(country);
  } catch (err) {
    document.getElementById("result").innerHTML = "<p>国データ取得失敗</p>";
    console.error(err);
  }
}

// ===============================
// 国情報表示
// ===============================
function displayCountry(country) {
  if (!country) {
    document.getElementById("result").innerHTML = "<p>データが見つかりません。</p>";
    return;
  }

  const nameJP = country.translations?.jpn?.common || country.name?.common || "不明";
  const official = country.name?.official || "不明";
  const area = country.area ? country.area.toLocaleString() : "不明";
  const population = country.population ? country.population.toLocaleString() : "不明";
  const currency = Object.values(country.currencies || {})[0]?.name || "不明";
  const flag = country.flags?.svg || country.flags?.png || "";

  document.getElementById("result").innerHTML = `
    <div class="country-card">
      <img src="${flag}" alt="flag">
      <h2>${nameJP}</h2>
      <p><strong>正式名:</strong> ${official}</p>
      <p><strong>面積:</strong> ${area} km²</p>
      <p><strong>人口:</strong> ${population}</p>
      <p><strong>通貨:</strong> ${currency}</p>
    </div>
  `;
}

// ===============================
// 国検索
// ===============================
async function searchCountry() {
  removeMap();

  const input = document.getElementById("searchInput").value;
  const normalized = normalizeText(input);

  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,translations,area,population,currencies,flags,independent"
    );
    if (!res.ok) throw new Error("API取得失敗");
    const data = await res.json();

    let found = data.find(c => {
      const jp = normalizeText(c.translations?.jpn?.common || "");
      const en = normalizeText(c.name?.common || "");
      return c.independent && (jp === normalized || en === normalized);
    });

    if (!found) {
      found = data.find(c => {
        const jp = normalizeText(c.translations?.jpn?.common || "");
        const en = normalizeText(c.name?.common || "");
        return jp.includes(normalized) || en.includes(normalized);
      });
    }

    if (found) {
      displayCountry(found);
    } else {
      document.getElementById("result").innerHTML = "<p>国が見つかりませんでした</p>";
    }
  } catch (err) {
    document.getElementById("result").innerHTML = "<p>検索中にエラー発生</p>";
    console.error(err);
  }
}

// ===============================
// 地図処理（ここが重要）
// ===============================
let map = null;

function removeMap() {
  if (map !== null) {
    map.remove();   // Leafletの内部データを完全削除
    map = null;
  }
}

function showMap() {
  document.getElementById('searchDiv').style.display = 'none';

  removeMap(); // ← 毎回リセット

  document.getElementById('result').innerHTML = "<div id='map' style='height:500px;'></div>";

  map = L.map('map').setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

// ===============================
// サイドバーボタン切替
// ===============================
function showSearch() {
  removeMap();
  document.getElementById('searchDiv').style.display = 'block';
  document.getElementById('result').innerHTML = '';
}
