<template src="./Tester.html"/>

<script>
import axios from "axios";
import dialogs from "@/utils/dialogs";

export default {
  name: "PasswordTester",
  data() {
    return {
      password: '',
      weaknesses: '',
      strengthMessage: 'Először adj meg egy jelszót, majd indítsd a vizsgálatot.',
      status: 'not-started',
      showPassword: false
    };
  },
  computed: {
    statusClass() {
      return {
        'status-not-started': this.status === 'not-started',
        'status-starting': this.status === 'starting',
        'status-in-progress': this.status === 'in-progress',
        'status-done': this.status === 'done',
        'status-failed': this.status === 'failed'
      };
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async testPassword() {
      this.status = 'in-progress';
      this.strengthMessage = 'Jelszó erősségének vizsgálata folyamatban...';
      const payload = {
            password: this.password
      };
      try{
        const response = await axios.post("/testpassword", payload);
        this.weaknesses = response.data.weaknesses;
        if(this.weaknesses.length < 2){
          this.status = 'done';
          this.strengthMessage = "A jelszo biztonsagos!"; 
        }
        else {
          this.status = 'failed';
          this.strengthMessage = "A jelszo nem biztonsagos!";
        }
      }
      catch (error) {
        this.status = 'not-started';
        if (error.response) {
            dialogs.showError("Nem sikerült letesztelni a jelszot.\n" + error.response.data.error);
        }
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    },
    async generatePassword() {
      this.status = 'in-progress';
      this.strengthMessage = 'Jelszó generálása folyamatban...';
      const payload = {};
      try{
        const response = await axios.get("/genpassword", payload);
        this.password = response.data.password;
        this.weaknesses = ''
        if(this.weaknesses.length < 2){
          this.status = 'done';
          this.strengthMessage = "A jelszo biztonsagos!"; 
        }
        else {
          this.status = 'failed';
          this.strengthMessage = "A jelszo nem biztonsagos!";
        }
      }
      catch (error) {
        this.status = 'not-started';
        if (error.response) {
            dialogs.showError("Nem sikerült generalni egy jelszot.\n" + error.response.data.error);
        }
        else
          dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
@import "./Tester.css";
</style>