<template src="./Results.html"/>

<script>
import axios from "axios";
import dialogs from "@/utils/dialogs";

export default {
    name: "CrackingResults",
    data() {
      return {
        searchQuery: '',
        results: []
      };
    },
    computed: {
      filteredResults() {
        if (!this.searchQuery) {
          return this.results;
        }
        
        const query = this.searchQuery.toLowerCase();
        return this.results.filter(result => 
          result.description.toLowerCase().includes(query) ||
          result.recordId.toString().includes(query) ||
          result.encryptionType.toLowerCase().includes(query)
        );
      }
    },
    methods: {
      async fetchResults() {
        try {
          const response = await axios.get("/list_cracked");
          this.results = await response.data.cracked_list;
        } catch (error) {
            if(error.response)
                dialogs.showError("Nem sikerült lekérni az eredményeket:\n" + error.response.data.error);
            else
                dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
            console.error("Nem sikerült lekérni az eredményeket:", error);
        }
      },
      async downloadResult(id) {
        try {
            const response = await axios.post(
            "/get_cracked",
            { record_id: id },
            { responseType: "blob" }
            );

            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'result.zip';

            if (contentDisposition) {
            const match = contentDisposition.match(/cracked_list="?(.+)"?/);
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
            const err = await error.response.data.text();
            const err_msg = JSON.parse(err);
            if(error.response)
                dialogs.showError("Sikertelen eredmény letöltés:\n " + err_msg.error);
            else
                dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
            console.error("Error downloading the result:", error);
        }
    },
    },
    mounted() {
        this.fetchResults();
    }
};
</script>

<style scoped src="./Results.css"/>
