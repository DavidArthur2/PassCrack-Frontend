<template>
  <div class="upload-container">
    <div class="header">
      <h1>Jelszólista Kezelő</h1>
    </div>

    <div class="form-section">
      <h2>Új jelszólista létrehozása</h2>
      <form @submit.prevent="createPasswordList">
        <div class="input-group">
          <input
            type="text"
            v-model="newName"
            placeholder="Új azonosító megadása"
            maxlength="20"
            class="input"
          />
          <button type="submit" class="btn">Létrehoz</button>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>

    <div class="list-section">
      <h2>
        Jelenlegi Jelszólisták
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Keresés név szerint..."
          class="search-bar"
        />
      </h2>
      <ul v-if="filteredPasswordLists && filteredPasswordLists.length" class="password-list">
        <li
          v-for="list in filteredPasswordLists"
          :key="list.name"
          class="list-item"
        >
          <span class="identifier">{{ list.name }}</span>

          <span
            class="status"
            :class="list.encryption[0] === 'None' || list.encryption.length === 1 && list.encryption[0] == ''? 'missing' : 'uploaded'"
          >
            Titkosított fájl:
            {{ list.encryption[0] === 'None' || list.encryption.length === 1 && list.encryption[0] == '' ? 'Nincs fájl feltöltve' : list.encryption.join(',') }}
            <button
              v-if="!(list.encryption[0] === 'None' || list.encryption.length === 1 && list.encryption[0] == '')"
              @click="downloadFile(list.name, 'encrypted')"
              class="download-btn"
            >
              Letöltés
            </button>
          </span>

          <span
            class="status"
            :class="list.raw === 'False' ? 'missing' : 'uploaded'"
          >
            Nyers fájl:
            {{ list.raw === 'False' ? 'Nincs fájl feltöltve' : 'Elérhető' }}
            <button
              v-if="list.raw !== 'False'"
              @click="downloadFile(list.name, 'raw')"
              class="download-btn"
            >
              Letöltés
            </button>
          </span>

          <div class="actions">
            <label>
              Titkosított feltöltése:
              <input
                type="file"
                @change="handleFileUpload($event, list.name, 'encrypted')"
              />
              <select
                v-model="encryptionType[list.name]"
                class="encryption-select"
              >
                <option disabled value="">Válasszon titkosítási típust</option>
                <option value="md5">MD5</option>
                <option value="sha1">SHA1</option>
                <option value="sha256_ps">SHA256_PS</option>
                <option value="sha256_sp">SHA256_SP</option>
                <option value="wpa2">WPA2</option>
              </select>
            </label>
            <label>
              Nyers feltöltése:
              <input
                type="file"
                @change="handleFileUpload($event, list.name, 'raw')"
              />
            </label>
          </div>
        </li>
      </ul>

      <p v-else>Nincsenek jelszólisták.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dialogs from "@/utils/dialogs";

export default {
  name: "UploadFile",
  data() {
    return {
      newName: "",
      passwordLists: [],
      errorMessage: "",
      searchQuery: "",
      encryptionType: {},
    };
  },
  computed: {
    filteredPasswordLists() {
      return (this.passwordLists || []).filter((list) =>
      list.name?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    },
  },
  methods: {
    async fetchPasswordLists() {
      try {
        const response = await axios.get("/passwords");
        this.passwordLists = response.data.passwordlists.map((list) => ({
          name: list.name,
          encryption: list.encryption,
          raw: list.raw,
        }));
      } catch (error) {
        dialogs.showError("Nem sikerült lekérni a jelszólistákat:");
        console.error("Nem sikerült lekérni a jelszólistákat:", error);
      }
    },
    async createPasswordList() {
      if (!/^[a-z0-9_]{1,20}$/.test(this.newName)) {
        this.errorMessage =
          "Az azonosítónak kisbetűket, számokat, vagy alulvonást kell tartalmaznia, és maximum 20 karakter lehet.";
        return;
      }
      try {
        await axios.post("/createlist", { name: this.newName });
        this.errorMessage = "";
        this.newName = "";
        await this.fetchPasswordLists();
        dialogs.showSuccess("Jelszó lista sikeresen létrehozva!")
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || "Nem sikerült létrehozni az azonosítót.";
      }
    },
    async handleFileUpload(event, name, type) {
      const file = event.target.files[0];
      if (!file) return;

      const selectedList = this.passwordLists.find((list) => list.name === name);
      if (type === "encrypted") {
        if (selectedList.encryption.includes(this.encryptionType[name])) {
          dialogs.showError("Már van feltöltve ilyen titkosított fájl ehhez az azonosítóhoz.");
          event.target.value = '';
          return;
        }

        const encType = this.encryptionType[name];
        if (!encType) {
          dialogs.showError("Kérjük, válassza ki a titkosítási típust!");
          event.target.value = '';
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("enc_type", encType);

        try {
          await axios.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          dialogs.showSuccess("Titkosított fájl sikeresen feltöltve.");
          await this.fetchPasswordLists();
        } catch (error) {
          dialogs.showError("Nem sikerült feltölteni a fájlt. " + (error.response?.data?.error || ""));
        }
        finally{
          event.target.value = '';
        }
      } else if (type === "raw") {
        if (selectedList.raw !== "False") {
          dialogs.showError("Már van feltöltve nyers fájl ehhez az azonosítóhoz.");
          event.target.value = '';
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("enc_type", "raw");

        try {
          await axios.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          dialogs.showSuccess("Nyers fájl sikeresen feltöltve.");
          await this.fetchPasswordLists();
        } catch (error) {
          dialogs.showError("Nem sikerült feltölteni a fájlt. " + (error.response?.data?.error || ""));
        }
        finally{
          event.target.value = '';
        }
      }
    },
    async downloadFile(name, type) {
      try {
        const response = await axios.post(
          "/getpasswordlist",
          { name, type },
          { responseType: "blob" }
        );

        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'files.zip';

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+)"?/);
          if (match && match[1]) {
            fileName = match[1];
          }
        }

        const blob = new Blob([response.data], { type: "application/zip" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error downloading the file:", error);
        dialogs.showError("Failed to download the file.");
      }
    },
  },
  mounted() {
    this.fetchPasswordLists().catch((error) => {
    console.error("Error fetching password lists:", error);
    this.passwordLists = [];
  });
  },

};
</script>

<style scoped>
@import "./Upload.css";
</style>
