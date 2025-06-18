<template src="./Encrypt.html"/>

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
      description: "",
    };
  },
  computed: {
    filteredPasswordLists() {
      const query = this.searchQuery.toLowerCase();
      return this.passwordLists.filter(
        (file) => file.raw === "true" && file.name.toLowerCase().includes(query)
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
        case "In Progress":
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
    showDescriptionDialog() {
      const res = dialogs.showInputDialog("Megjegyzés", "Add meg az enkriptálás leírását", "Leírás...", "Indítás", "Mégse");
      res.then((result) => {
        if (result.isConfirmed) {
          if(result.value.length > 50)
            return dialogs.showError("Túl hosszú megjegyzés, maximum 50 karakter!");
          this.description = result.value || "-";
          this.startEncryption();
        }
      });
    },
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
        const response = await axios.get("/passwords");
        this.passwordLists = response.data.passwordlists;
      } catch (error) {
        if(error.response)
          dialogs.showError("Hiba a jelszófájlok lekérésekor:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error("Error at fetching the passwordlists:", error);
      }
    },
    async fetchEncryptions() {
      try {
        const response = await axios.get("/getencryptions");
        this.encryptionOptions = response.data.encryptions;
      } catch (error) {
        if(error.response)
          dialogs.showError("Hiba a titkosítási módszerek lekérésekor: " + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error("Error at fetching methods:", error);
      }
    },
    async fetchStatus(boot = false) {
      if (!this.timerActive && boot !== true) return;
      try {
        const response = await axios.get("/encryptstatus");
        const progress = response.data.progress;
        const fileName = response.data.fileName;

        this.encryptionStatus = progress;
        this.currentFileName = fileName;
        if (progress.status === "In Progress") {
          if(this.isEncrypting === false)
            this.startTimer();
          this.isEncrypting = true;
        } else if (
          progress.status === "Done" ||
          progress.status === "Failed" ||
          progress.status === "Not started"
        ) {
          this.isEncrypting = false;
          this.stopTimer();
          if (progress === "Done")
            dialogs.showSuccess("Titkosítás befejezve!");
          else if (progress === "Failed")
            dialogs.showError("Titkosítás sikertelen!");
        }
      } catch (error) {
        if(error.response)
          dialogs.showError("Hiba a titkosítás állapotának lekérésekor:\n" + error.response.data.error);
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error("Error at fetching status:", error);
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
        this.selectedEncryption = null;
      }
    },
    async startEncryption() {
      try {
        const payload = {
          name: this.selectedFile.name,
          encryption: this.selectedEncryption,
          description: this.description,
        };
        await axios.post("/startencrypt", payload);

        this.startTimer();
        this.fetchStatus();
        this.isEncrypting = true;
      } catch (error) {
        if (error.response) {
          dialogs.showError("Nem sikerült a visszafejtés indítása:\n" + error.response.data.error);
        }
        else {
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        }
        console.error("Error at starting the encryption: ", error);
      }
    },
  },
  async mounted() {
    await this.fetchPasswordLists();
    await this.fetchEncryptions();
    await this.fetchStatus(true);
  },
  beforeUnmount() {
    this.stopTimer();
  },
};
</script>

<style scoped>
@import "./Encrypt.css";
</style>
