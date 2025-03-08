<template>
    <div class="regex-container">
        <h1 class="title">Reguláris Kifejezés Tesztelő</h1>
        <form @submit.prevent="showDescriptionDialog" class="form">
            <div class="form-group">
                <label for="regex">Reguláris Kifejezés Minta</label>
                <input
                    v-model="regex"
                    type="text"
                    id="regex"
                    placeholder="Add meg a reguláris kifejezést..."
                    class="input-field"/>
                <small class="instruction-text">Add meg a tesztelni kívánt reguláris kifejezést.</small>
            </div>

            <div class="form-group">
                <label for="sample_number">Minta Méret (0-100)</label>
                <input
                    v-model="sampleNumber"
                    type="number"
                    id="sample_number"
                    min="0"
                    max="100"
                    value="5"
                    class="input-field"/>
                <small class="instruction-text">Add meg, hány találatot szeretnél látni (alapértelmezett: 5).</small>
            </div>

            <button type="submit" class="btn-run">Reguláris Kifejezés Futattása</button>
        </form>

        <div v-if="results.count !== null" class="results-container">
            <div class="header-row">
                <h2>Eredmények</h2>
                <div class="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="commaSeparator"
                        v-model="commaSeparator"
                        class="checkbox"/>
                    <label for="commaSeparator">Eredmények vesszővel elválasztva</label>
                </div>
            </div>
            <p><strong>Talált eredmények száma:</strong> {{ results.count }}</p>
            <textarea v-model="formattedResults" readonly class="results-textbox"></textarea>
        </div>
    </div>
</template>
  
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
          const response = await axios.post("/run_regex", payload);
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
    },
  };
</script>
  
<style>
@import "./Regex.css";
</style>
  