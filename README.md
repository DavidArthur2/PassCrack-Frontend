# Üzembe helyezési útmutató

Ebben a fejezetben bemutatom azt, hogy a fentebb leírt rendszert hogyan lehet üzembe helyezni lépésről lépésre, beleértve a gazda rendszer előkészítését, szükséges csomagokat, alkalmazásokat telepíteni, illetve azt, hogy hogyan tudjuk a projektet elindítani. Fontos, hogy a fogadó rendszernek megkell felelnie a legalább a Hardware és software specifikációk al-fejezetben leírt specifikációknak, ellenben nem garantált az, hogy a projekt működni fog.
# Hardver- és szoftverspecifikáció:

* **Operációs rendszer:** Debian 24.04.1 LTS
* **Processzor:** AMD EPYC 7252 8-Core Processor 2.8GHz - 3.2GHz
* **Memória:** 256GB DDR4
* **Videókártya:** 1x RTX A5000 24GB Memória
* **Tárhely:** 2.6TB SSD
* **Internet kapcsolati sebesség:** 500 Mbps
  
## Üzembe helyezési lépések:

A telepítés Ubuntu Linux rendszeren történik, és magában foglalja a backend (Python), a frontend (Vue.js), az adatbázis (PostgreSQL), valamint a Hashcat telepítését és beállítását.

### 1. A szükséges csomagok telepítése:

Frissítsük a csomaglistát és telepítsük a szükséges függőségeket, a terminálon lefuttatva az alábbi a parancsokat
```
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.12 python3.12-venv python3.12-dev git postgresql postgresql-contrib hashcat nodejs npm
```

### 2. PostgreSQL adatbázis beállítása:

Indítsuk el a PostgreSQL szolgáltatást, majd hozzunk létre egy adatbázist és felhasználót
```
sudo systemctl start postgresql
sudo -u postgres psql
```

Miután megnyílt a PostgreSQL konzol, az alábbi parancsokat futtassuk le:
```
CREATE DATABASE passwords;
CREATE USER hacker WITH PASSWORD 'SajatJelszo';
ALTER ROLE hacker SET client_encoding TO 'utf8';
ALTER ROLE hacker SET default_transaction_isolation TO 'read committed';
ALTER ROLE hacker SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE passwords TO hacker;
\q
```

### 3. A backend telepítése:

Klónozzuk a backend kódját a GitHub-ról, majd hozzunk létre és aktiváljunk egy virtuális környezetet. Futtassuk le az alábbi parancsokat a terminálon
```
git clone https://github.com/DavidArthur2/PassCrack-Backend.git
cd PassCrack-Backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Nyissuk meg egy szövegszerkesztővel a **Config.py** fájlt, és adjuk meg a megfelelő elérési utakat, és adatokat. Ezután indítsuk el a backendet
```
python main.py
```

### 4. A frontend telepítése:

Klónozzuk a frontend kódját, majd telepítsük a függőségeket
```
git clone https://github.com/DavidArthur2/PassCrack-Frontend.git
cd PassCrack-Frontend
npm install
```

Szerkesszük a konfigurációs fájlt, ahova megadjuk az elérési útját a backendnek (általában localhost, és 8001 port)
```
nano src/utils/config.js
```

Indítsuk el a front-endet
```
npm run serve
```

### 5. A rendszer tesztelése:

Ha mindegyik rész sikeresen elindult, navigáljunk a front-end címére, és ellenőrizzük hogy betöltődik-e az oldal. Általában `http://localhost:8080`
