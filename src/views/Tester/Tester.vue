<template>
    <div class="encrypt-container">
      <h1 class="title">Jelszó erősség tesztelő</h1>
      
      <div class="password-list-section">
        <div class="header-row">
          <h2>Írd be a jelszavad</h2>
        </div>
        <div class="password-input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            class="search-bar" 
            placeholder="Ide írd a jelszavad."
          />
          <button 
            class="toggle-password-btn" 
            @click="togglePasswordVisibility" 
            type="button" 
            :title="showPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'"
          >
            <span v-if="showPassword">👁️</span>
            <span v-else>👁️‍🗨️</span>
          </button>
        </div>
      </div>
      
      <div class="action-section">
        <button @click="testPassword" :disabled="!password">Jelszó kipróbálása</button>
        <button @click="generatePassword">Biztonságos jelszó generálása</button>
      </div>
      
      <div class="status-section" :class="statusClass">
        <h2>Erősség vizsgálat eredménye</h2>
        <p>{{ strengthMessage }}</p>
      </div>
      
      <div class="encryption-section">
        <h2>Gyengeségek</h2>
        <textarea 
          v-model="weaknesses" 
          readonly 
          rows="6"
        ></textarea>
      </div>
    </div>
  </template>
  
  <script>
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
      testPassword() {
        this.status = 'in-progress';
        this.strengthMessage = 'Jelszó erősségének vizsgálata folyamatban...';
        //Ide jön még a backend hívás
      },
      generatePassword() {
        //Backend hívás a jelszó kérésre
      }
    }
  };
  </script>
  
  <style scoped>
  @import "./Tester.css";
  </style>