import XLSX from "xlsx";
import readline from "readline";

const calismaDosyasi = XLSX.readFile("odevdegerler.xlsx");

let calismaKagitlari = {};
for (const calismaKagitIsim of calismaDosyasi.SheetNames) {
    calismaKagitlari[calismaKagitIsim] = XLSX.utils.sheet_to_json(calismaDosyasi.Sheets[calismaKagitIsim]);
}

// Buraya kadar olan kısımda excel dosyasının içeriklerini calismaKagitlari objesine atadım.

// İçerisinde değerleri saklayabileceğim bir obje oluşturuyorum ve içerisine boş objeler tanımlıyorum
let Butunyil = {
    "Miktarlar": {},
    "Olasiliklar": {},
    "Kumilatif": {},
    "KumilatifRandomTest": {}
};
let toplamFrekans = 0;

// Verdigin odev dosyasındaki sayfanın adı Sheet1 olduğu için o sayfaya bakıyor ve forEach metodu ile kaç satır varsa üzerinden geçiyor
// Üzerinden geçerken ben bu değerleri oluşturduğum boş objenin ilgili kısımlarına atıyorum. Organize edebilmem ve programın dinamik
// olabilmesi için dosyadan gelen "Miktar" (ÖR: 3,4,5,6) yoksa, objenin içerisinde bu değerleri oluşturuyor(hasOwnProperty)
calismaKagitlari["Sheet1"].forEach((item, index) => {
    if (!Butunyil["Miktarlar"].hasOwnProperty(item["Miktar"]) || !Butunyil["Olasiliklar"].hasOwnProperty(item["Miktar"]) || !Butunyil["Kumilatif"].hasOwnProperty(item["Miktar"])) {
        // Burada oluşturulan değer null. İçerisine değer atayabilmem için önce initialize etmem gerek.
        Butunyil["Miktarlar"][item["Miktar"]] = 0
        Butunyil["Olasiliklar"][item["Miktar"]] = 0;
        Butunyil["Kumilatif"][item["Miktar"]] = 0;
        Butunyil["KumilatifRandomTest"][item["Miktar"]] = 0;
    }
    // Eğer dosyanın içinden gelen "Miktar" zaten var ise 1 ekliyor
    Butunyil["Miktarlar"][item["Miktar"]] += 1;
    // Toplam frekans ile dosyanın kaç satır olduğunu sayıyorum.
    toplamFrekans += 1;
});

// Objeler diziler gibi 0'dan başlamazlar. En baştan sona doğru tarayabilmem için forEach metodunu Object sınıfı ile kullanmak zorundayız.
Object.keys(Butunyil["Miktarlar"]).forEach((frekans, index) => {
    // Olasılık = Frekans / Toplam Frekans | İsimler biraz kafa karıştırabiliyor.
    Butunyil["Olasiliklar"][frekans] = Butunyil["Miktarlar"][frekans] / toplamFrekans;
});

// Objeleri diziler gibi tarayabilmem için boş bir dizi oluşturup ilk index'ine 0 değeri atıyorum
// Bu diziye kümilatif değerleri atayacağım.
let dizi = [0];
// Kümilatifi number değişkenine toplayarak atarken bir yandan yukarıda oluşturduğum diziye atacağım.
let number = 0;
Object.keys(Butunyil["Olasiliklar"]).forEach((value, index) => {
    // ÖRN:
    // 0 = 0 + 0.833333333
    // 0.833333333 = 0.833333333 + 0.2222222222
    // 0.305555556 = 0.305555556 + 0.2777777778
    number += Butunyil["Olasiliklar"][value];
    // Yukarıdaki örnekte verdiğim gibi bulduğum kümilatif değerleri oluşturduğum geçici diziye atıyorum.
    dizi.push(number);
});

// Yukarıda oluşturduğum geçici dizideki değerleri, objeyi taratarak, objenin içine atıyorum.
Object.keys(Butunyil["Kumilatif"]).forEach((item, index) => {
    Butunyil["Kumilatif"][item] = dizi[index];
});

// Kumilatif değerleri eşleştirmeyi kolaylaştırmak için objeye kaydettiğim değerleri yeniden geçici bir diziye anahtarlar
// ve diziler ayrı dizide olmak üzere 2 farklı diziye atıyorum
let keys = []; // 3, 4, 5, 6
let values = []; // 0, 0.1875, 0.5625, 0.8333333333333333
Object.entries(Butunyil["Kumilatif"]).forEach(([key, value], index) => {
    keys.push(key);
    typeof value === "string" ? values.push(parseFloat(value)) : values.push(value);
});
// Şuanda Anahtarlar 3, 4, 5, 6 | Anahtarlara karşılık gelen değerler 0, 0.1875, 0.5625, 0.8333333333333333
values.push(1);
// values.push(1) ile değerlerin sonuncu index'ine 1 değerini atıyorum. Bunu yapmamın sebebi hemen aşağıdaki fonksiyonda
// hesaplama yaparkan 0.8333333333333333 ve 1 arasını karşılaştırmak zorunda kalacak olmamız. Eğer bu karşılaştırmayı
// yapamazsak en son kümilatif değere karşılık gelen "Miktar" yani 6'ya hiç bir değer +1 olarak atılamaz. 0 olarak kalır

// Ayları döngüde çıkarmak için burada bir dizi tanımladım.
const aylarDizi = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const kumilatifHesapla = (maxDonguSayi, number, max) => {
    let yil = 2022; // Yıl 2022'den başlıyor
    let ayYil = 0; // ayYil değişkeni ile yukarıda tanımladığım aylarDizi'sini döngüye sokacağım.
    let yirmiIki = 0; // Sadece ilk 12 ayı yazdırmasını istediğim için oluşturduğum bir değişken
    // const generatedRandomNumber = ortaKareYontemi(number, max);
    for (let i = 0; i < maxDonguSayi; i++) { // Programı çalıştırırken istenen döngü sayısı maxDonguSayi
        let randomNumber = Math.random(); // Oluşturulan random decimal sayı
        // let randomNumber = generatedRandomNumber[i];
        for (let j = 0; j < values.length - 1; j++) { // Dizideki değerlerin sayısı - 1 kadar döndürüyorum. Çünkü aşağıda j + 1'i kontrol ediyorum. Yoksa hata verir.
            if (randomNumber >= values[j] && randomNumber < values[j + 1]) { // Oluşan random sayı bu kümilatif değerlerin arasında mı diye kontrol ediyor
                Butunyil["KumilatifRandomTest"][keys[j]] += 1; // Hani kümilatif değerlerin arasında ise o "Miktar"'a 1 ekliyor
                if (yirmiIki < 12) { // İlk 12 ayı yazdırmak için oluşturduğum if
                    console.log(aylarDizi[ayYil], yil, "Miktar: ", [keys[j]].toString());
                    yirmiIki++;
                }
                if (i > 0 && i % 11 === 0) { // aylarDizisi'ni döngüde tutabilmem için her 11'de bir sıfır oluyor. JS'de diziler 0'dan başlıyor.
                    ayYil = 0;
                    yil++;
                } else {
                    ayYil++;
                }

            }
        }
    }
}


const ortaKareYontemi = (random, max, min = 0, randArray = []) => {
    let newRand = "";
    let randPow = random * random; // girilen random sayının karesini alıyorum.
    // karesini aldığım random sayıyı stringe dönüştürüp basamaklarına ayırıyorum.
    // Böylece virgüllere göre arasından dört rakam seçebiliyorum
    let newRandSeperated = randPow.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Eğer sadece bir virgül var ise, ÖRN: 4,500 ya da 7,325
    // İlk dört rakamını alıyorum
    if (newRandSeperated.indexOf(",") === newRandSeperated.lastIndexOf(",")) {
        for (let i = 0; i < 4; i++) {
            newRand += randPow.toString()[i];
        }
    } else {
        let counter = 0; // counter sayacı ile rasgele oluşturduğum sayının karesinin ortasından alacağım sayıda
        // kaç tane 0 olduğunu öğrenmek için oluşturdum. Böylece diyelim ki 3 tane sıfır var.
        // ÖRN: 40,009,023. Buradan 0090 yani 90 alınacağı için rasgele sayılar döngüye girmeye başlayacak.
        // Bunu önlemek için eğer içinde 3 ve daha fazla 0 var ise bir geriden sayıları seçtiriyorum.
        // Böylece programın sonsuza kadar rastgele sayılar üretmesini sağlıyor
        for (let i = newRandSeperated.indexOf(","); i < newRandSeperated.lastIndexOf(","); i++) {
            if (parseInt(randPow.toString()[i])) {
                counter++;
            }
        }
        if (counter <= 2) {
            for (let i = newRandSeperated.indexOf(",") - 1; i < newRandSeperated.lastIndexOf(",") - 1; i++) {
                newRand += randPow.toString()[i]; // Oluşan dört rakamı newRand string'ine atıyorum.
            }
        } else {
            for (let i = newRandSeperated.indexOf(","); i < newRandSeperated.lastIndexOf(","); i++) {
                newRand += randPow.toString()[i];
            }
        }
    }
    newRand = parseFloat(newRand); // Yukarıda oluşturduğum, rastgele gelen 4 rakamı float'a dönüştürüyorum.
    if (min < max) {
        randArray.push(newRand / 10000); // Oluşan bu sayıyı decimale dönüştürüp diziye atıyorum
        return ortaKareYontemi(newRand, max, min + 1, randArray);
    } else {
        return randArray; // Maximum döngüye ulaştığında diziyi geri döndürüyor.
    }
}

// Tek Duze dağılım yöntemi ile oluşan rastgele değerleri formül ile oluşturuyorduk
const tekduzeDagitimliYontem = (a, c, m, z, max, uDizi = [], i = 0) => {
    let u = z / m;
    let newZ = (a * z + c) % 16;
    if (i < max) { // girilen max değere kadar fonksiyon recursion yani özyineleme halinde
        uDizi.push(u); // Oluşan rasgele dizileri bir diziye atıyorum
        return tekduzeDagitimliYontem(a, c, m, newZ, max, uDizi, i + 1);
    } else {
        return uDizi; // Girdiğimiz max döngü sayısına geldiğinde ise dizi'yi return ediyorum.
    }
}

const maxDonguSayi = readline.createInterface({ // Burada JS'nin bir kütüphanesi olan readline ile input alıyorum.
    input: process.stdin,
    output: process.stdout
});

maxDonguSayi.question("Lütfen Döngü Sayısıni Giriniz: ", function (sayi) {
    kumilatifHesapla(sayi);
    console.log("Monte Carlo benzetimiyle bulunan değerler: ", Butunyil["KumilatifRandomTest"]);
    console.log("Olasılıklar: ", Butunyil["Olasiliklar"]);
    console.log("Kümilatif değerler: ", Butunyil["Kumilatif"]);
    console.log("Orta Kare Yöntemi ile üretilen sayı dizisi: ", ortaKareYontemi(5497, sayi));
    console.log("Tekdüze Dağılım ile üretilen sayı dizisi: ", tekduzeDagitimliYontem(5, 3, 16, 7, sayi));
    maxDonguSayi.close();
});
