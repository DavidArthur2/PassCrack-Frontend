<template src="./Upload.html"/>

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
        if(error.response)
          dialogs.showError("Nem sikerült lekérni a jelszólistákat:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
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
        console.error(error);
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
          if(error.response)
            dialogs.showError("Nem sikerült feltölteni a fájlt. " + (error.response.data.error || ""));
          else
            dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
          console.error(error);
        }
        finally{
          event.target.value = '';
        }
      } else if (type === "raw") {
        if (selectedList.raw !== "false") {
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
          if(error.response)
            dialogs.showError("Nem sikerült feltölteni a fájlt. " + (error.response.data.error || ""));
          else
            dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
          console.error(error);
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

        URL.revokeObjectURL(link.href);
      } catch (error) {
        if(error.response)
          dialogs.showError("Sikertelen fájl letöltés:\n " + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error("Error downloading the file:", error);
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
