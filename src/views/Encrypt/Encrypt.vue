<template>
  <div class="encrypt-container">
    <section class="password-list-section">
      <div class="header-row">
        <h2>Jelszófájl kiválasztása</h2>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Keresés..."
          class="search-bar"
        />
      </div>
      <ul v-if="filteredPasswordLists.length">
        <li
          v-for="file in filteredPasswordLists"
          :key="file.name"
          @click="selectFile(file)"
          :class="{ selected: selectedFile && selectedFile.name === file.name }"
        >
          {{ file.name }}
        </li>
      </ul>
      <p v-else>Nincs elérhető jelszófájl titkosításhoz.</p>
    </section>

    <section v-if="selectedFile" class="encryption-section">
      <h2>Titkosítási módszer kiválasztása</h2>
      <select v-model="selectedEncryption" @change="checkExistingEncryption">
        <option v-for="enc in encryptionOptions" :key="enc" :value="enc">
          {{ enc }}
        </option>
      </select>
    </section>

    <section class="action-section">
      <button :disabled="!canStart || isEncrypting" @click="startEncryption">
        Titkosítás Indítása
      </button>
    </section>

    <section v-if="encryptionStatus" :class="['status-section', statusClass]">
      <h2>Titkosítás Állapota</h2>
      <p>Státusz: {{ encryptionStatus.status }}</p>
      <p v-if="currentFileName">Fájl: {{ currentFileName }}</p>
      <p v-if="encryptionStatus.percentage">Állapot: {{ encryptionStatus.percentage.toFixed(2) }}% / 100%</p>
      <p v-if="encryptionStatus.progress">Folyamatban lévő sorok: {{ encryptionStatus.progress }}</p>
      <p v-if="encryptionStatus.total">Összes sor: {{ encryptionStatus.total }}</p>
      <p v-if="encryptionStatus.averageSpeed">Átlagos sebesség: {{ encryptionStatus.averageSpeed }}</p>
      <p v-if="encryptionStatus.maxSpeed">Maximális sebesség: {{ encryptionStatus.maxSpeed }}</p>
      <p v-if="encryptionStatus.estimatedEndTime">Becsült befejezési idő: {{ encryptionStatus.estimatedEndTime }}</p>
      <p v-if="encryptionStatus.remainingTime">Hátralevő idő: {{ encryptionStatus.remainingTime }}</p>
    </section>

  </div>
</template>


<script>
import axios from "axios";
import dialogs from "@/utils/dialogs";

export default {
  name: "PasswordEncrypt",
  data() {
    return {
      passwordLists: [],
      encryptionOptions: [],
      selectedFile: null,
      selectedEncryption: null,
      encryptionStatus: null,
      currentFileName: null,
      encryptingFile: null,
      statusTimer: null,
      isEncrypting: false,
      searchQuery: "",
      timerActive: false,
    };
  },
  computed: {
    filteredPasswordLists() {
      const query = this.searchQuery.toLowerCase();
      return this.passwordLists.filter(
        (file) => file.raw === "True" && file.name.toLowerCase().includes(query)
      );
    },
    canStart() {
      return this.selectedFile && this.selectedEncryption && !this.isEncrypting;
    },
    statusClass() {
      const status = this.encryptionStatus?.status;
      switch (status) {
        case "Done":
          return "status-done";
        case "In progress":
          return "status-in-progress";
        case "Failed":
          return "status-failed";
        case "Not started":
        default:
          return "status-not-started";
      }
    },
  },
  methods: {
    startTimer() {
      if (!this.timerActive) {
        this.timerActive = true;
        this.statusTimer = setInterval(this.fetchStatus, 1000);
      }
    },
    stopTimer() {
      if (this.statusTimer) {
        clearInterval(this.statusTimer);
        this.statusTimer = null;
        this.timerActive = false;
      }
    },
    async fetchPasswordLists() {
      try {
        const response = await axios.get("http://localhost:8001/passwords");
        this.passwordLists = response.data.passwordlists;
      } catch (error) {
        dialogs.showError("Hiba a jelszófájlok lekérésekor: Részletek a logban");
        console.error("Hiba a jelszófájlok lekérésekor:", error);
      }
    },
    async fetchEncryptions() {
      try {
        const response = await axios.get("http://localhost:8001/getencryptions");
        this.encryptionOptions = response.data.encryptions;
      } catch (error) {
        dialogs.showError(
          "Hiba a titkosítási módszerek lekérésekor: Részletek a logban"
        );
        console.error("Hiba a titkosítási módszerek lekérésekor:", error);
      }
    },
    async fetchStatus() {
      if (!this.timerActive) return;
      try {
        const response = await axios.get("http://localhost:8001/encryptstatus");
        const progress = response.data.progress;
        const fileName = response.data.fileName;

        this.encryptionStatus = progress;
        this.currentFileName = fileName;

        if (progress === "In progress") {
          this.isEncrypting = true;
        } else if (
          progress === "Done" ||
          progress === "Failed" ||
          progress === "Not started"
        ) {
          this.isEncrypting = false;
          this.stopTimer();
          if (progress === "Done")
            dialogs.showSuccess("Titkosítás befejezve!");
          else if (progress === "Failed")
            dialogs.showError("Titkosítás sikertelen!");
        }
      } catch (error) {
        dialogs.showError(
          "Hiba a titkosítás állapotának lekérésekor: Részletek a logban"
        );
        console.error("Hiba a titkosítás állapotának lekérésekor:", error);
      }
    },
    selectFile(file) {
      this.selectedFile = file;
      this.selectedEncryption = null;
    },
    checkExistingEncryption() {
      if (
        this.selectedFile &&
        this.selectedFile.encryption &&
        this.selectedFile.encryption.includes(this.selectedEncryption)
      ) {
        dialogs.showError(
          `A "${this.selectedFile.name}" fájl már tartalmazza a "${this.selectedEncryption}" titkosítást.`
        );
      }
    },
    async startEncryption() {
      try {
        const payload = {
          name: this.selectedFile,
          encryption: this.selectedEncryption,
        };
        const response = await axios.post(
          "http://localhost:8001/startencrypt",
          payload
        );

        if (response.status === 200) {
          this.startTimer();
          this.fetchStatus();
          this.isEncrypting = true;
        }
      } catch (error) {
        dialogs.showError(
          "Hiba a titkosítás indításakor: Részletek a logban"
        );
        console.error("Hiba a titkosítás indításakor:", error);
      }
    },
  },
  async mounted() {
    await this.fetchPasswordLists();
    await this.fetchEncryptions();
    this.startTimer();
    await this.fetchStatus();
  },
  beforeUnmount() {
    this.stopTimer();
  },
};
</script>

<style scoped>
@import "./Encrypt.css";
</style>
