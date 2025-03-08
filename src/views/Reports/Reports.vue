<template>
  <div class="report-page">
    <h1>Mérések grafikus megjelenítése</h1>
    <div class="controls">

      <div class="form-group">
        <label for="measurement-type">Mérés típusa:</label>
        <select id="measurement-type" class="form-control" v-model="selectedMeasurementType" @change="onMeasurementTypeChange">
          <option disabled value="">Please select one</option>
          <option v-for="type in measurementTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <div class="form-group" v-if="selectedMeasurementType">
        <label for="x-axis-options">X tengely opciók:</label>
        <select id="x-axis-options" class="form-control" v-model="selectedXAxisOptions" multiple>
          <option v-for="option in xAxisOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div class="form-group" v-if="selectedMeasurementType">
        <label for="y-axis-options">Y tengely opciók:</label>
        <select id="y-axis-options" class="form-control" v-model="selectedYAxisOptions" multiple>
          <option v-for="option in yAxisOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div class="form-group" v-if="selectedMeasurementType">
        <label for="record-selection">Kiválasztott rekordok:</label>
        <select id="record-selection" class="form-control" v-model="selectedRecords" multiple>
          <option v-for="record in availableRecords" :key="record.id" :value="record.id">{{ record.description }}</option>
        </select>
      </div>

      <button class="btn btn-primary" @click="fetchData">Grafikon frissítése</button>
      <button class="btn btn-secondary" @click="clearSelections">Összes törlése</button>
    </div>

    <div class="chart-container">
      <canvas id="graph"></canvas>
    </div>
  </div>
</template>

<script>
  import Chart from 'chart.js/auto';
  import axios from 'axios';
  import dialogs from "@/utils/dialogs";

  export default {
    name: 'ReportPage',
    data() {
      return {
        measurementTypes: ['Encryption', 'Cracking', 'Regex'],
        selectedMeasurementType: '',
        xAxisOptions: [],
        yAxisOptions: [],
        selectedXAxisOptions: [],
        selectedYAxisOptions: [],
        availableRecords: [],
        selectedRecords: [],
        chartData: null,
        chart: null,
      };
    },
    methods: {
      async onMeasurementTypeChange() {
        this.selectedXAxisOptions = [];
        this.selectedYAxisOptions = [];
        this.selectedRecords = [];
        this.updateAxisOptions();
        await this.fetchAvailableRecords();
      },
      updateAxisOptions() {
        if (this.selectedMeasurementType === 'Encryption') {
          this.xAxisOptions = ['encryption_type', 'password_list', 'description'];
          this.yAxisOptions = ['maximum_speed', 'average_speed', 'encrypted_number'];
        } else if (this.selectedMeasurementType === 'Cracking') {
          this.xAxisOptions = ['encrypted_list','cracked_list','pattern','dictionary','description'];
          this.yAxisOptions = ['success_ratio','maximum_speed','average_speed','cracked_number',];
        } else if (this.selectedMeasurementType === 'Regex') {
          this.xAxisOptions = ['description', 'regex'];
          this.yAxisOptions = ['count'];
        } else {
          this.xAxisOptions = [];
          this.yAxisOptions = [];
        }
      },
      async fetchAvailableRecords() {
        try {
          const response = await axios.get('/records', {
            params: {
              measurementType: this.selectedMeasurementType,
            },
          });
          this.availableRecords = response.data.records;
        } catch (error) {
          if(error.response)
            dialogs.showError('Sikertelen adatlekérés:' + error.response.data.error)
          else
            dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
          console.error('Error fetching records:', error);
        }
      },
      clearSelections() {
        this.selectedMeasurementType = '';
        this.selectedXAxisOptions = [];
        this.selectedYAxisOptions = [];
        this.selectedRecords = [];
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
      },
      async fetchData() {
        if (
          !this.selectedMeasurementType ||
          this.selectedXAxisOptions.length === 0 ||
          this.selectedYAxisOptions.length === 0 ||
          this.selectedRecords.length === 0
        ) {
          dialogs.showInfo('Kérlek válaszd ki a tengelyek opcióit, a mérés típusát, és a megjeleníteni kívánt rekordokat!');
          return;
        }

        const payload = {
          measurementType: this.selectedMeasurementType,
          recordIds: this.selectedRecords,
        };

        try {
          const response = await axios.post('/chartdata',payload);
          const data = response.data;
          this.updateChart(data);
        } catch (error) {
          if(error.response)
            dialogs.showError('Sikertelen adatlekérés:' + error.response.data.error)
          else
            dialogs.showError("Váratlan hiba történt\nEllenőrizd a logokat!");
          console.error('Error fetching chart data:', error);
        }
      },
      updateChart(data) {
        if (this.chart) {
          this.chart.destroy();
        }
        const ctx = document.getElementById('graph').getContext('2d');

        const datasets = this.selectedYAxisOptions.map((yOption) => {
          return {
            label: yOption,
            data: data.map((item) => item[yOption]),
            backgroundColor: this.getRandomColor(),
          };
        });

        const xLabels = data.map((item) => {
          return this.selectedXAxisOptions.map((xOption) => item[xOption]).join(' / ');
        });

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: xLabels,
            datasets: datasets,
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  afterBody: (tooltipItems) => {
                    const dataIndex = tooltipItems[0].dataIndex;
                    const item = data[dataIndex];
                    return [
                      `Start Time: ${item.start_time}`,
                      `End Time: ${item.end_time}`,
                      ...(item.average_speed ? [`Average speed: ${item.average_speed}`] : []),
                      ...(item.maximum_speed ? [`Maximum speed: ${item.maximum_speed}`] : []),
                      ...(item.description ? [`Description: ${item.description}`] : []),
                      ...(item.encryption_type ? [`Encryption type: ${item.encryption_type}`] : []),
                      ...(item.password_list ? [`Password list: ${item.password_list}`] : []),
                      ...(item.encrypted_number ? [`Encrypted number: ${item.encrypted_number}`] : []),
                      ...(item.encrypted_list ? [`Encrypted list: ${item.encrypted_list}`] : []),
                      ...(item.cracked_list ? [`Cracked list: ${item.cracked_list}`] : []),
                      ...(item.pattern ? [`Pattern: ${item.pattern}`] : []),
                      ...(item.dictionary ? [`Dictionary: ${item.dictionary}`] : []),
                      ...(item.cracked_number ? [`Cracked number: ${item.cracked_number}`] : []),
                      ...(item.regex ? [`Regex: ${item.regex}`] : []),
                      ...(item.count ? [`Count: ${item.count}`] : []),
                    ];
                  },
                },
              },
            },
          },
        });
      },
      getRandomColor() {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
      },
    },
    mounted() {
    },
  };
</script>

<style scoped>
@import "./Reports.css";
</style>