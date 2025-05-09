<template src="./Cracking.html"/>

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
