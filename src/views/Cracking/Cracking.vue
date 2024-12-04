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

    <section class="action-section">
      <button :disabled="!canStart" @click="startCracking">
        Start
      </button>
    </section>

    <section v-if="crackingStatus" class="status-section">
      <h2>Visszafejtés állapota</h2>
      <p>Státusz: {{ crackingStatus.Status }}</p>
      <p>Sebesség: {{ crackingStatus.Speed }}</p>
      <p>Progress: {{ crackingStatus.Progress }}</p>
      <p>GPU: {{ crackingStatus["Hardware.GPU"] }}</p>
      <p>CPU: {{ crackingStatus["Hardware.CPU"] }}</p>
      <p>Indítás ideje: {{ crackingStatus["Time.Started"] }}</p>
      <p>Becsült befejezési idő: {{ crackingStatus["Time.Estimated"] }}</p>
      <!--<p v-if="crackingStatus["Time.Stopped"].length">Befejeződött ekkor: {{ crackingStatus["Time.Stopped"] }}</p>-->
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
  },
  methods: {
    async fetchPasswordLists() {
      try {
        const response = await axios.get("/passwords");
        this.passwordLists = response.data.passwordlists;
      } catch (error) {
        dialogs.showError("Nem sikerült a jelszólisták betöltése.");
        console.error(error);
      }
    },
    async fetchPatterns() {
      try {
        const response = await axios.get("/patterns");
        this.patternOptions = response.data;
      } catch (error) {
        dialogs.showError("Nem sikerült a minták betöltése.");
        console.error(error);
      }
    },
    selectPasswordList(file) {
      this.selectedPasswordList = file;
      if (this.selectedCrackType === "dictionary") {
        this.wordlistOptions = this.passwordLists.filter(
          (list) => list.raw === "True"
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
        rule: this.selectedPattern === null ? "" : this.selectedPattern
      };
      try {
        const response = await axios.put("/startcrack", payload);
        if (response.status === 200) {
          this.startStatusPolling();
        }
      } catch (error) {
        dialogs.showError("Nem sikerült elindítani a visszafejtést.");
        console.error(error);
      }
    },
    async fetchCrackingStatus() {
      try {
        const response = await axios.get("/crackstatus");
        this.crackingStatus = response.data;
        if (this.crackingStatus.Status !== "In Progress") {
          this.stopStatusPolling();
        }
      } catch (error) {
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
  },
  async mounted() {
    await this.fetchPasswordLists();
    await fetchCrackStatus();
  },
  beforeUnmount() {
    this.stopStatusPolling();
  },
};
</script>

<style scoped>
@import "../Encrypt/Encrypt.css";
.password-cracking-container {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.type-selection,
.password-list-selection,
.encryption-selection,
.start-section,
.status-section {
  margin-bottom: 20px;
}

.selected {
  background-color: #007bff;
}

.mask-info {
  font-size: 0.85em;
  color: gray;
  margin-top: 0.5em;
}
</style>
