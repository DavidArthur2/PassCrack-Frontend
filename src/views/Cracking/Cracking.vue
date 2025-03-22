<template>
  <div class="password-cracking-container">
    <section class="crack-type-section">
      <h2>Visszafejtés típusa</h2>
      <select v-model="selectedCrackType" @change="handleCrackTypeChange">
        <option disabled value="">Válasszon ki egy visszafejtés típust a listából!</option>
        <option value="dictionary">Dictionary</option>
        <option value="mask">Mask</option>
      </select>
    </section>

    <section class="encrypted-password-list-section">
      <h2>Visszafejtendő jelszó lista</h2>
      <ul v-if="passwordLists.length">
        <li
          v-for="file in passwordLists"
          :key="file.name"
          @click="selectPasswordList(file)"
          :class="{ selected: selectedPasswordList && selectedPasswordList.name === file.name }"
        >
          {{ file.name }}
        </li>
      </ul>
      <p v-else>Nincs elérhető jelszó lista.</p>
    </section>

    <section v-if="selectedCrackType === 'dictionary'" class="wordlist-section">
      <h2>Wordlist</h2>
      <ul v-if="wordlistOptions.length">
        <li
          v-for="file in wordlistOptions"
          :key="file.name"
          @click="selectWordlist(file)"
          :class="{ selected: selectedWordlist && selectedWordlist.name === file.name }"
        >
          {{ file.name }}
        </li>
      </ul>
      <p v-else>Nincs elérhető wordlist fájl.</p>

      <h2>Pattern(opcionális)</h2>
      <select v-if="patternOptions.length" v-model="selectedPattern">
        <option disabled value="">Válasszon ki egy patternt a listából!</option>
        <option value="">Pattern kihagyása</option>
        <option v-for="pattern in patterns" :key="pattern" :value="pattern">
          {{ pattern }}
        </option>
      </select>
      <p v-else>Nincs elérhető pattern.</p>
    </section>

    <section v-if="selectedCrackType === 'mask'" class="mask-section">
      <h2>Mask</h2>
      Írd be a használni kívánt maszkot:
      <input
        type="text"
        v-model="maskInput"
      />
      <small class="mask-info"><br />
        ?l = abcdefghijklmnopqrstuvwxyz<br />
        ?u = ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
        ?d = 0123456789<br />
        ?h = 0123456789abcdef<br />
        ?H = 0123456789ABCDEF<br />
        ?s = «space»!"#$%&'()*+,-./:;&lt;=&gt;?@[\]^_`{|}~<br />
        ?a = ?l?u?d?s<br />
        ?b = 0x00 - 0xff
      </small>
    </section>

    <section v-if="selectedPasswordList" class="encryption-selection">
      <h2>Enkriptálás</h2>
      <select v-model="selectedEncryption" @change="checkEncryption">
        <option disabled value="">Válasszon ki egy enkriptálást a listából!</option>
        <option v-for="encryption in selectedPasswordList.encryption" :key="encryption" :value="encryption">
          {{ encryption }}
        </option>
      </select>
    </section>

    <section v-if="crackingStatus" class="action-section">
      <button :disabled="!canStart" @click="showDescriptionDialog">
        Start
      </button>
      <button v-if="crackingStatus.Status === 'In Progress' || crackingStatus.Status === 'Starting'" @click="cancelCracking">
        Cancel
      </button>
    </section>


    <section v-if="crackingStatus" :class="['status-section', statusClass]">
      <h2>Visszafejtés állapota</h2>
      <p v-if="crackingStatus.Status">Státusz: {{ crackingStatus.Status }}</p>
      <p v-if="crackingStatus['Speed1']">Sebesség1: {{ crackingStatus['Speed1'] }}</p>
      <p v-if="crackingStatus['Error']">Hiba: {{ crackingStatus['Error'] }}</p>
      <p v-if="crackingStatus['Speed2']">Sebesség2: {{ crackingStatus['Speed2'] }}</p>
      <p v-if="crackingStatus['Progress']">Progress: {{ crackingStatus['Progress'] }}</p>
      <p v-if="crackingStatus['Hardware.GPU']">GPU: {{ crackingStatus['Hardware.GPU'] }}</p>
      <p v-if="crackingStatus['Hardware.CPU']">CPU: {{ crackingStatus['Hardware.CPU'] }}</p>
      <p v-if="crackingStatus['Time.Started']">Indítás ideje: {{ crackingStatus['Time.Started'] }}</p>
      <p v-if="crackingStatus['Time.Estimated']">Becsült befejezési idő: {{ crackingStatus['Time.Estimated'] }}</p>
      <p v-if="crackingStatus['Recovered']">Visszafejtett: {{ crackingStatus['Recovered'] }}</p>
      <p v-if="remainingTime">Maradt idő: {{ remainingTime }}</p>
      <p v-if="crackingStatus['Time.Stopped']">Befejeződött ekkor: {{ crackingStatus['Time.Stopped'] }}</p>
  </section>
  </div>
</template>

<script>
import axios from "axios";
import dialogs from "@/utils/dialogs";

export default {
  name: "PasswordCracking",
  data() {
    return {
      selectedCrackType: null,
      passwordLists: [],
      wordlistOptions: [],
      patternOptions: [],
      selectedPasswordList: null,
      selectedWordlist: null,
      selectedPattern: null,
      selectedEncryption: null,
      maskInput: "",
      crackingStatus: null,
      timer: null,
      description: "",
    };
  },
  computed: {
    canStart() {
      if (this.selectedCrackType === "dictionary") {
        return this.selectedPasswordList && this.selectedWordlist;
      }
      if (this.selectedCrackType === "mask") {
        return this.selectedPasswordList && this.maskInput.trim();
      }
      return false;
    },
    statusClass() {
      const status = this.crackingStatus?.Status;
      console.log(status);
      switch (status) {
        case "Done":
          return "status-done";
        case "In Progress":
          return "status-in-progress";
        case "Failed":
          return "status-failed";
        case "Starting":
          return "status-starting";
        case "Not Started":
        default:
          return "status-not-started";
      }
    },
    remainingTime() {
      const days = this.crackingStatus["Days.Needed"] || 0;
      const hours = this.crackingStatus["Hours.Needed"] || 0;
      const minutes = this.crackingStatus["Minutes.Needed"] || 0;
      const seconds = this.crackingStatus["Seconds.Needed"] || 0;
      const years = this.crackingStatus["Years.Needed"] || 0;
      const months = this.crackingStatus["Months.Needed"] || 0;

      let remainingTime = "";

      if (years > 0) remainingTime += `${years} év, `;
      if (months > 0) remainingTime += `${months} hónap, `;
      if (days > 0) remainingTime += `${days} nap, `;
      if (hours > 0) remainingTime += `${hours} óra, `;
      if (minutes > 0) remainingTime += `${minutes} perc, `;
      if (seconds > 0) remainingTime += `${seconds} másodperc`;

      remainingTime = remainingTime.trim().replace(/,$/, "");

      return remainingTime
    }
  },
  methods: {
    showDescriptionDialog() {
      const res = dialogs.showInputDialog("Megjegyzés", "Add meg a visszafejtés leírását", "Leírás...", "Indítás", "Mégse");
      res.then((result) => {
        if (result.isConfirmed) {
          if(result.value.length > 50)
            return dialogs.showError("Túl hosszú megjegyzés, maximum 50 karakter!");
          this.description = result.value || "-";
          this.startCracking();
        }
      });
    },
    async fetchPasswordLists() {
      try {
        const response = await axios.get("/passwords");
        this.passwordLists = response.data.passwordlists;
      } catch (error) {
        if(error.response)
          dialogs.showError("Nem sikerült a jelszólisták betöltése:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    },
    async fetchPatterns() {
      try {
        const response = await axios.get("/patterns");
        this.patternOptions = response.data;
      } catch (error) {
        if(error.response)
          dialogs.showError("Nem sikerült a minták betöltése:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    },
    selectPasswordList(file) {
      this.selectedPasswordList = file;
      if (this.selectedCrackType === "dictionary") {
        this.wordlistOptions = this.passwordLists.filter(
          (list) => list.raw === "true"
        );
      }
    },
    selectWordlist(file) {
      this.selectedWordlist = file;
    },
    selectPattern(pattern) {
      this.selectedPattern = pattern;
    },
    handleCrackTypeChange() {
      this.selectedPasswordList = null;
      this.selectedWordlist = null;
      this.selectedPattern = null;
      this.maskInput = "";
      if (this.selectedCrackType === "dictionary") {
        this.fetchPatterns();
      }
    },
    async startCracking() {
      const payload = {
        crack_type: this.selectedCrackType,
        passwordlist: this.selectedPasswordList?.name,
        encryption: this.selectedEncryption,
        aux:
          this.selectedCrackType === "dictionary"
            ? this.selectedWordlist?.name
            :  this.maskInput,
        rule: this.selectedPattern === null ? "" : this.selectedPattern,
        description: this.description,
      };
      try {
        await axios.put("/startcrack", payload);
        dialogs.showSuccess("Sikeres visszafejtés indítás!");
        this.startStatusPolling();
      } catch (error) {
        if(error.response){
          dialogs.showError("Nem sikerült elindítani a visszafejtést.\n" + error.response.data.error);
        }
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    },
    async fetchCrackingStatus() {
      try {
        const response = await axios.get("/crackstatus");
        this.crackingStatus = response.data;
        if (this.crackingStatus.Status !== "In Progress" && this.crackingStatus.Status !== "Starting") {
          this.stopStatusPolling();
        }
      } catch (error) {
        if(error.response)
            dialogs.showError("Egy hiba lépett fel:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    },
    startStatusPolling() {
      this.timer = setInterval(this.fetchCrackingStatus, 1000);
    },
    stopStatusPolling() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    async cancelCracking() {
      try {
        await axios.post("/cancelcrack");
        dialogs.showSuccess("Visszafejtes sikeresen lezárva!");
      } catch (error) {
        console.error("Error canceling the cracking process:", error);
        if(error.response)
          dialogs.showError("Visszafejtes lezarasa sikertelen!\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
      }
    }
  },
  async mounted() {
    await this.fetchPasswordLists();
    await this.fetchCrackingStatus();
    if (this.crackingStatus.Status === "In Progress") {
          this.startStatusPolling();
    }
  },
  beforeUnmount() {
    this.stopStatusPolling();
  },
};
</script>

<style scoped>
@import "../Encrypt/Encrypt.css";
@import "./Cracking.css";
</style>
