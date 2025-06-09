<template src="./Regex.html"/>
  
<script>
  import axios from "axios";
  import dialogs from "@/utils/dialogs";
  
  export default {
    name: "RegexRunner",
    data() {
      return {
        regex: "",
        sampleNumber: 5,
        results: {
          count: null,
          samples: [],
        },
        commaSeparator: false,
        formattedResults: "",
        description: "",
        currentRunDescription: null,
        isCurrentlyRunning: false,
      };
    },
    watch: {
      results: {
        handler() {
          this.formatResults();
        },
        deep: true,
      },
      commaSeparator: {
        handler() {
          this.formatResults();
        },
        immediate: true,
      },
    },
    methods: {
      showDescriptionDialog() {
        const res = dialogs.showInputDialog("Megjegyzés", "Add meg a mérés leírását", "Leírás...", "Indítás", "Mégse");
        res.then((result) => {
          if (result.isConfirmed) {
            if(result.value.length > 50)
              return dialogs.showError("Túl hosszú megjegyzés, maximum 50 karakter!");
            this.description = result.value || "-";
            this.runRegex();
          }
        });
      },
      async runRegex() {
        const payload = {
          regex: this.regex,
          sample_number: this.sampleNumber,
          description: this.description
        };
  
        try {
          this.currentRunDescription = this.description;
          this.isCurrentlyRunning = true;
          const response = await axios.post("/run_regex", payload, {
            timeout: 2400000 // 40 min
          });
          const { count, samples } = response.data.result;
          this.results.count = count;
          this.results.samples = samples;
          dialogs.showSuccess("A reguláris kifejezés sikeresen lefutott!");
        } catch (error) {
          if (error.response) {
              dialogs.showError("Nem sikerült elindítani a reguláris kifejezést.\n" + error.response.data.error);
          }
          else
            dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
          console.error(error);
        } finally {
          console.log("Regex run completed");
          this.isCurrentlyRunning = false;
        }
      },
      formatResults() {
        if (this.results.count !== null && this.results.samples.length > 0 && this.results.count > 0) {
          if (this.commaSeparator) {
            this.formattedResults = this.results.samples.join(", ");
          } else {
            this.formattedResults = this.results.samples.join("\n");
          }
        }
        else {
            this.formattedResults = "";
        }
      },
      async checkRegexStatus() {
          try {
              const response = await axios.get("/get_regex_status");
              const { result } = response.data;
              
              this.isCurrentlyRunning = result === 'running';
              this.currentRunDescription = result.description;
          } catch (error) {
              console.error('Error checking regex status:', error);
          }
      },
      startStatusPolling() {
          this.statusInterval = setInterval(async () => {
              if (this.isCurrentlyRunning) {
                  await this.checkRegexStatus();
              }
          }, 5000);
      },

      stopStatusPolling() {
          if (this.statusInterval) {
              clearInterval(this.statusInterval);
              this.statusInterval = null;
          }
      },
    },
    async mounted() {
        await this.checkRegexStatus();
        this.startStatusPolling();
    },
  };
</script>
  
<style>
@import "./Regex.css";
</style>
  