import XLSX from "xlsx";
import readline from "readline";

const calismaDosyasi = XLSX.readFile("odevdegerler.xlsx");

let calismaKagitlari = {};
for (const calismaKagitIsim of calismaDosyasi.SheetNames) {
    calismaKagitlari[calismaKagitIsim] = XLSX.utils.sheet_to_json(calismaDosyasi.Sheets[calismaKagitIsim]);
}

let Butunyil = {
    "Miktarlar": {},
    "Olasiliklar": {},
    "Kumilatif": {},
    "KumilatifRandomTest": {}
};
let toplamFrekans = 0;

calismaKagitlari["Sheet1"].forEach((item, index) => {
    if (!Butunyil["Miktarlar"].hasOwnProperty(item["Miktar"]) || !Butunyil["Olasiliklar"].hasOwnProperty(item["Miktar"]) || !Butunyil["Kumilatif"].hasOwnProperty(item["Miktar"])) {
        Butunyil["Miktarlar"][item["Miktar"]] = 0
        Butunyil["Olasiliklar"][item["Miktar"]] = 0;
        Butunyil["Kumilatif"][item["Miktar"]] = 0;
        Butunyil["KumilatifRandomTest"][item["Miktar"]] = 0;
    }
    Butunyil["Miktarlar"][item["Miktar"]] += 1;
    toplamFrekans += 1;
});

Object.keys(Butunyil["Miktarlar"]).forEach((frekans, index) => {
    Butunyil["Olasiliklar"][frekans] = Butunyil["Miktarlar"][frekans] / toplamFrekans;
});

let dizi = [0];
let number = 0;
Object.keys(Butunyil["Olasiliklar"]).forEach((value, index) => {
    number += Butunyil["Olasiliklar"][value];
    dizi.push(number);
});

Object.keys(Butunyil["Kumilatif"]).forEach((item, index) => {
    Butunyil["Kumilatif"][item] = dizi[index];
});

let keys = [];
let values = [];
Object.entries(Butunyil["Kumilatif"]).forEach(([key, value], index) => {
    keys.push(key);
    typeof value === "string" ? values.push(parseFloat(value)) : values.push(value);
});

values.push(1);
// values[4] = 1;


const ortaKareYontemi = (random, max, min = 0, randArray = []) => {
    let newRand = "";
    let randPow = random * random;
    let newRandSeperated = randPow.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (newRandSeperated.indexOf(",") === newRandSeperated.lastIndexOf(",")) {
        for (let i = 0; i < 4; i++) {
            newRand += randPow.toString()[i];
        }
    } else {
        let counter = 0;
        for (let i = newRandSeperated.indexOf(","); i < newRandSeperated.lastIndexOf(","); i++) {
            if (parseInt(randPow.toString()[i])) {
                counter++;
            }
        }
        if (counter <= 2) {
            for (let i = newRandSeperated.indexOf(",") - 1; i < newRandSeperated.lastIndexOf(",") - 1; i++) {
                newRand += randPow.toString()[i];
            }
        } else {
            for (let i = newRandSeperated.indexOf(","); i < newRandSeperated.lastIndexOf(","); i++) {
                newRand += randPow.toString()[i];
            }
        }
    }
    newRand = parseFloat(newRand);
    if (min < max) {
        randArray.push(newRand / 10000);
        return ortaKareYontemi(newRand, max, min + 1, randArray);
    } else {
        return randArray;
    }
}

// console.log("Orta Kare Yöntemi ile üretilen sayı dizisi: ", ortaKareYontemi(5497, 1000));

const tekduzeDagitimliYontem = (a, c, m, z, max, uDizi = [], i = 0) => {
    let u = z / m;
    let newZ = (a * z + c) % 16;
    if (i < max) {
        // if (i % 15 === 0) {
        //     uDizi.push(u);
        //     return tekduzeDagitimliYontem(a + 50, c, m, newZ, max, uDizi, i + 1);
        // } else {
        //     uDizi.push(u);
        //     return tekduzeDagitimliYontem(a, c, m, newZ, max, uDizi, i + 1);
        // }
        uDizi.push(u);
        return tekduzeDagitimliYontem(a, c, m, newZ, max, uDizi, i + 1);
    } else {
        return uDizi;
    }
}
// console.log("Tekdüze Dağılım ile üretilen sayı dizisi: ", tekduzeDagitimliYontem(5, 3, 16, 7, 10));
const aylarDizi = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const kumilatifHesapla = (maxDonguSayi, number, max) => {
    let yil = 2022;
    let ayYil = 0;
    // const generatedRandomNumber = ortaKareYontemi(number, max);
    for (let i = 0; i < maxDonguSayi; i++) {
        let randomNumber = Math.random();
        // let randomNumber = generatedRandomNumber[i];
        for (let j = 0; j < values.length - 1; j++) {
            if (randomNumber >= values[j] && randomNumber < values[j + 1]) {
                Butunyil["KumilatifRandomTest"][keys[j]] += 1;
                console.log(aylarDizi[ayYil], yil, "Miktar: ", [keys[j]].toString());
                if (i > 0 && i % 11 === 0) {
                    ayYil = 0;
                    yil++;
                } else {
                    ayYil++;
                }

            }
        }
    }
}

const maxDonguSayi = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

maxDonguSayi.question("Lütfen Döngü Sayısıni Giriniz: ", function (sayi) {
    kumilatifHesapla(sayi);
    console.log("Monte Carlı benzetimiyle bulunan değerler: ", Butunyil["KumilatifRandomTest"]);
    console.log("Orta Kare Yöntemi ile üretilen sayı dizisi: ", ortaKareYontemi(5497, sayi));
    console.log("Tekdüze Dağılım ile üretilen sayı dizisi: ", tekduzeDagitimliYontem(5, 3, 16, 7, sayi));
    maxDonguSayi.close();
});

// kumilatifHesapla(maxDonguSayi);

// console.log(Butunyil["KumilatifRandomTest"]);