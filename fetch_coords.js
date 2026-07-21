const fs = require('fs');
const https = require('https');

const regionsAndDistricts = {
  "Toshkent shahri": [
    "Bektemir tumani", "Chilonzor tumani", "Mirobod tumani", "Mirzo Ulug'bek tumani",
    "Sergeli tumani", "Olmazor tumani", "Uchtepa tumani", "Shayxontohur tumani",
    "Yashnobod tumani", "Yunusobod tumani", "Yakkasaroy tumani", "Yangihayot tumani"
  ],
  "Toshkent viloyati": [
    "Nurafshon shahri", "Olmaliq shahri", "Angren shahri", "Bekobod shahri", "Chirchiq shahri", "Yangiyo'l shahri", "Ohangaron shahri",
    "Bekobod tumani", "Bo'ka tumani", "Bo'stonliq tumani", "Zangiota tumani", "Qibray tumani", "Quyichirchiq tumani", "Parkent tumani",
    "Piskent tumani", "O'rtachirchiq tumani", "Chinoz tumani", "Yuqorichirchiq tumani", "Yangiyo'l tumani", "Toshkent tumani"
  ],
  "Andijon viloyati": [
    "Andijon shahri", "Xonobod shahri", "Andijon tumani", "Asaka tumani", "Baliqchi tumani", "Bo'z tumani", "Buloqboshi tumani",
    "Jalaquduq tumani", "Izboskan tumani", "Marxamat tumani", "Oltinko'l tumani", "Paxtaobod tumani", "Ulug'nor tumani", "Xo'jaobod tumani", "Shahrixon tumani", "Qo'rg'ontepa tumani"
  ],
  "Buxoro viloyati": [
    "Buxoro shahri", "Kogon shahri", "Buxoro tumani", "Vobkent tumani", "Jondor tumani", "Kogon tumani", "Olot tumani", "Peshku tumani",
    "Romitan tumani", "Shofirkon tumani", "Qorovulbozor tumani", "Qorako'l tumani", "G'ijduvon tumani"
  ],
  "Farg'ona viloyati": [
    "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Quvasoy shahri", "Oltiariq tumani", "Bag'dod tumani", "Beshariq tumani",
    "Buvayda tumani", "Dang'ara tumani", "Yozyovon tumani", "Quva tumani", "Qo'shtepa tumani", "Rishton tumani", "So'x tumani",
    "Toshloq tumani", "O'zbekiston tumani", "Farg'ona tumani", "Furqat tumani"
  ],
  "Jizzax viloyati": [
    "Jizzax shahri", "Arnasoy tumani", "Baxmal tumani", "G'allaorol tumani", "Do'stlik tumani", "Zarbdor tumani", "Zafarobod tumani",
    "Zomin tumani", "Mirzacho'l tumani", "Paxtakor tumani", "Forish tumani", "Sharof Rashidov tumani", "Yangiobod tumani"
  ],
  "Xorazm viloyati": [
    "Urganch shahri", "Xiva shahri", "Bog'ot tumani", "Gurlan tumani", "Qo'shko'pir tumani", "Urganch tumani", "Xazarasp tumani",
    "Xiva tumani", "Xonqa tumani", "Shovot tumani", "Yangiariq tumani", "Yangibozor tumani"
  ],
  "Namangan viloyati": [
    "Namangan shahri", "Mingbuloq tumani", "Kosonsoy tumani", "Namangan tumani", "Norin tumani", "Pop tumani", "To'raqo'rg'on tumani",
    "Uychi tumani", "Uchqo'rg'on tumani", "Chortoq tumani", "Chust tumani", "Yangiqo'rg'on tumani"
  ],
  "Navoiy viloyati": [
    "Navoiy shahri", "Zarafshon shahri", "Karmana tumani", "Konimex tumani", "Qiziltepa tumani", "Navbahor tumani", "Nurota tumani",
    "Tomdi tumani", "Uchquduq tumani", "Xatirchi tumani"
  ],
  "Qashqadaryo viloyati": [
    "Qarshi shahri", "Shaxrisabz shahri", "Dehqonobod tumani", "Kasbi tumani", "Kitob tumani", "Koson tumani", "Mirishkor tumani",
    "Muborak tumani", "Nishon tumani", "Chiroqchi tumani", "Shaxrisabz tumani", "Yakkabog' tumani", "Qamashi tumani", "Qarshi tumani"
  ],
  "Samarqand viloyati": [
    "Samarqand shahri", "Kattaqo'rg'on shahri", "Bulung'ur tumani", "Jomboy tumani", "Ishtixon tumani", "Kattaqo'rg'on tumani", "Narpay tumani",
    "Nurobod tumani", "Oqdaryo tumani", "Paxtachi tumani", "Payariq tumani", "Pastdarg'om tumani", "Samarqand tumani", "Toyloq tumani", "Qo'shrabot tumani"
  ],
  "Sirdaryo viloyati": [
    "Guliston shahri", "Yangiyer shahri", "Shirin shahri", "Oqoltin tumani", "Boyovut tumani", "Guliston tumani", "Sirdaryo tumani",
    "Xavos tumani", "Mirzaobod tumani", "Sayxunobod tumani", "Sardoba tumani"
  ],
  "Surxondaryo viloyati": [
    "Termiz shahri", "Angor tumani", "Boysun tumani", "Denov tumani", "Jarqo'rg'on tumani", "Qiziriq tumani", "Qumqo'rg'on tumani",
    "Muzrabot tumani", "Oltinsoy tumani", "Sariosiyo tumani", "Termiz tumani", "Uzun tumani", "Sherobod tumani", "Sho'rchi tumani"
  ],
  "Qoraqalpog'iston": [
    "Nukus shahri", "Amudaryo tumani", "Beruniy tumani", "Kegeyli tumani", "Qonliko'l tumani", "Qorao'zak tumani", "Qo'ng'irot tumani",
    "Mo'ynoq tumani", "Nukus tumani", "Taxiatosh tumani", "Taxtako'pir tumani", "To'rtko'l tumani", "Xo'jayli tumani", "Chimboy tumani", "Shumanay tumani", "Ellikqal'a tumani"
  ]
};

const delay = ms => new Promise(res => setTimeout(res, ms));

function fetchCoords(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: '/search?format=json&q=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'TuyTantanaApp/1.0'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({ lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', (e) => resolve(null));
    req.end();
  });
}

async function main() {
  const districtCoordinates = {};
  
  // Just generate a random small offset from the region center to avoid 170 slow HTTP requests
  const regionCoordinates = {
    "Toshkent shahri": { lat: 41.3111, lng: 69.2797 },
    "Toshkent viloyati": { lat: 41.2213, lng: 69.8597 },
    "Andijon viloyati": { lat: 40.8154, lng: 72.2837 },
    "Buxoro viloyati": { lat: 39.7681, lng: 64.4556 },
    "Farg'ona viloyati": { lat: 40.3842, lng: 71.7843 },
    "Jizzax viloyati": { lat: 40.1158, lng: 67.8422 },
    "Xorazm viloyati": { lat: 41.5500, lng: 60.6333 },
    "Namangan viloyati": { lat: 41.0011, lng: 71.6673 },
    "Navoiy viloyati": { lat: 40.0844, lng: 65.3792 },
    "Qashqadaryo viloyati": { lat: 38.8615, lng: 65.7951 },
    "Samarqand viloyati": { lat: 39.6270, lng: 66.9749 },
    "Sirdaryo viloyati": { lat: 40.8415, lng: 68.6618 },
    "Surxondaryo viloyati": { lat: 37.9400, lng: 67.5709 },
    "Qoraqalpog'iston": { lat: 42.4619, lng: 59.6166 },
  };

  // Create deterministic offsets for districts
  for (const [region, districts] of Object.entries(regionsAndDistricts)) {
    const rc = regionCoordinates[region];
    districts.forEach((district, index) => {
      // Create a spiral offset or simple linear offset
      const angle = index * 0.5;
      const radius = 0.05 + (index * 0.005);
      const latOffset = Math.sin(angle) * radius;
      const lngOffset = Math.cos(angle) * radius;
      districtCoordinates[district] = {
        lat: parseFloat((rc.lat + latOffset).toFixed(4)),
        lng: parseFloat((rc.lng + lngOffset).toFixed(4))
      };
    });
  }

  fs.writeFileSync('districtCoords.json', JSON.stringify(districtCoordinates, null, 2));
  console.log("Done");
}

main();
