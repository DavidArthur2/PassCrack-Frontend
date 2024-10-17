<template>
  <div>
    <section id="introduction">
      <div class="content">
        <h2>Jelszavak Erőssége és Visszafejtése</h2>
        <p>A jelszavak erőssége és visszafejtése kulcsfontosságú a digitális biztonságban. Ez a projekt célja, hogy megvizsgálja a különböző kriptográfiai algoritmusokat és visszafejtési módszereket, és elemezze ezek hatékonyságát.</p>
        <p>Egy jól megválasztott jelszó nemcsak a személyes adataink, hanem a pénzügyi információink és az online identitásunk védelmét is szolgálja. A jelszavak biztonságos használata alapvető fontosságú a digitális térben való biztonságos létezéshez.</p>
      </div>
      <div class="image">
        <img src="../../../public/images/password_security.png" alt="Password strength chart" height="20%"/>
      </div>
    </section>

    <section id="features">
      <h2>Főbb témák</h2>
      <ul>
        <li>Kriptográfiai algoritmusok vizsgálata</li>
        <li>Visszafejtési módszerek tanulmányozása</li>
        <li>Felhasználóbarát védekezési technikák bemutatása</li>
      </ul>
    </section>

    <footer>
      <p>© 2024 Jelszavak Biztonsága. Minden jog fenntartva.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped>
/* Alapértelmezett beállítások */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Open Sans', sans-serif;
  background-color: #f4f7f6;
  color: #333;
}

/* Fejléc stílusok */
header {
  background-color: #4a90e2;
  color: white;
  padding: 20px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 40px;
  margin-right: 10px;
}

.logo h1 {
  font-size: 1.5em;
  font-weight: bold;
}

.nav-links {
  list-style-type: none;
}

.nav-links li {
  display: inline-block;
  margin-left: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 1em;
}

.nav-links a:hover {
  text-decoration: underline;
}

/* Bevezető szakasz */
section#introduction {
  display: flex;
  justify-content: space-around;
  align-items: flex-start; /* Változás: szöveg és kép igazítása fent */
  padding: 50px 100px;
  background-color: white;
}

section#introduction .content {
  max-width: 50%;
}

section#introduction .content h2 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

section#introduction .content p {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 20px; /* Változás: több térköz a bekezdések között */
}

section#introduction .image {
  max-width: 40%;
}

section#introduction img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Főbb témák szakasz */
section#features {
  background-color: #f8f8f8;
  padding: 40px 100px;
  text-align: center;
}

section#features h2 {
  font-size: 2em;
  margin-bottom: 30px;
  color: #4a90e2;
}

section#features ul {
  list-style-type: none;
  padding: 0;
}

section#features ul li {
  font-size: 1.2em;
  margin-bottom: 15px;
}

/* Lábléc stílusok */
footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

footer p {
  font-size: 1em;
}

/* Hover effektek */
section#features ul li:hover {
  color: #4a90e2;
  transition: color 0.3s ease;
}

/* Mobilbarát design */
@media (max-width: 768px) {
  section#introduction {
    flex-direction: column;
    padding: 20px;
  }

  section#introduction .content {
    max-width: 100%;
  }

  section#introduction .image {
    max-width: 100%;
    margin-top: 20px;
  }

  section#features {
    padding: 20px;
  }

  footer {
    padding: 10px;
  }
}
</style>