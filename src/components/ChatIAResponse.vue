<template>
  <div v-if="data && (data.topic || data.image)" class="chatia-response-root">
    <div class="chatia-header">
      <div class="chatia-header-title">
        <span v-if="data.topic" class="chatia-title">{{ data.topic }}</span>
      </div>
      <div v-if="data.image" class="chatia-header-img">
        <img :src="data.image" alt="Imagen relacionada" />
      </div>
    </div>
    <!-- Frase en cursiva y entre paréntesis -->
    <div v-if="data.phrase" class="chatia-phrase">
      (<em>{{ data.phrase }}</em>)
    </div>
    <!-- Resumen -->
    <div v-if="data.resumen" class="chatia-resumen">
      {{ data.resumen }}
    </div>
    <!-- Comparativa -->
    <div v-if="data.comparative && data.comparative.length" class="chatia-comparative">
      <div v-if="data.comparative_variable" class="comparative-title">{{ data.comparative_variable }}</div>
      <div v-if="data.comparative_description" class="comparative-desc">{{ data.comparative_description }}</div>
      <div v-if="chartData" class="comparative-chart">
        <LineChart :chartData="chartData" :chartOptions="chartOptions" />
      </div>
    </div>
    <!-- Noticias y Video juntos -->
    <div v-if="data.news && Array.isArray(data.news) && data.news.length" class="chatia-news">
      <div class="news-title">Noticias</div>
      <div class="news-list">
        <div v-for="(item, idx) in data.news" :key="idx" class="news-item">
          <div class="news-valor">{{ item.valor }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import LineChart from './LineChart.vue'
const props = defineProps<{ data: any }>()

type ComparativeRow = (string | number)[];
type Comparative = ComparativeRow[];
type Colors = string[];

function getChartData(comparative: Comparative, colors: Colors) {
  if (!comparative || comparative.length < 2) return null;
  // La primera columna es la variable independiente (labels del eje X)
  const header = comparative[0];
  const labels = comparative.slice(1).map((row: ComparativeRow) => row[0]);
  const datasets = [];
  for (let col = 1; col < header.length; col++) {
    const serieLabel = header[col];
    const data = comparative.slice(1).map((row: ComparativeRow) => {
      // Convertir a número si es posible
      const val = row[col];
      return typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
    });
    datasets.push({
      label: serieLabel,
      data,
      backgroundColor: colors && colors[col-1] ? colors[col-1] : 'rgba(0,0,0,0)',
      borderColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      pointBackgroundColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      pointBorderColor: colors && colors[col-1] ? colors[col-1] : 'var(--color-light-gold)',
      fill: false,
      tension: 0.3
    });
  }
  return { labels, datasets };
}

const chartData = computed(() => getChartData(props.data.comparative, props.data.colors));
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: 'var(--color-light-gold)',
        font: { size: 16 }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0,0,0,0)', // sin fondo
      titleColor: 'var(--color-light-gold)',
      bodyColor: 'var(--color-light-gold)',
      borderColor: 'var(--color-light-gold)',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'var(--color-light-gold)',
        lineWidth: 1
      },
      title: {
        display: true,
        text: 'Eje X',
        color: 'var(--color-light-gold)',
        font: { size: 18 }
      },
      ticks: {
        color: 'var(--color-light-gold)',
        font: { size: 14 }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'var(--color-light-gold)',
        lineWidth: 1
      },
      title: {
        display: true,
        text: 'Eje Y',
        color: 'var(--color-light-gold)',
        font: { size: 18 }
      },
      ticks: {
        color: 'var(--color-light-gold)',
        font: { size: 14 }
      }
    }
  }
};
</script>

<style scoped>
.chatia-response-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  height: 100%;
  color:var(--color-presentacion)
}
.chatia-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 2em;
  height:5%
}
.chatia-header-title {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.chatia-title {
  font-size: 5em;
  font-weight: bold;
  text-align: center;
  word-break: break-word;
}
.chatia-header-img {
  width: 160px;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chatia-header-img img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 1em;
  object-fit: cover;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.chatia-phrase {
  font-style: italic;
  text-align: center;
  margin-bottom: 0.5em;
  font-size: 1.1em;
}
.chatia-resumen {
  text-align: center;
  margin-bottom: 1em;
  font-size: 1.5em;
  line-height: 1.5;
}
.chatia-comparative {
  border: 2px solid var(--color-presentacion, #3498db);
  border-radius: 1em;
  padding: 1.5em 1em;
  margin: 1.5em auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  height: 40%;
  width: 100%;
}
.comparative-title {
  font-size: 2em;
  font-weight: bold;
  color: var(--color-presentacion, #3498db);
  text-align: center;
}
.comparative-desc {
  font-size: 1.5em;
  text-align: center;
}
.comparative-chart-placeholder {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  border: 1px dashed #b1c2d5;
  border-radius: 0.7em;
}
.comparative-chart {
  min-height: 220px;
  border-radius: 0.7em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1em;
  margin-top: 1em;
}
.chatia-news {
  border: 2px solid #217dbb;
  border-radius: 1em;
  margin: 0em auto 1em auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  width:69%;
  height: 35em;
}
.news-title {
  font-size: 2em;
  font-weight: bold;
  color: #217dbb;
  margin-bottom: 0.7em;
  text-align: left;
}
.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.news-item {
  border-radius: 0.7em;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.news-valor {
  font-size: 1.4em;
}
.news-link a {
  font-size: 1em;
  color: #3498db;
  text-decoration: underline;
  word-break: break-all;
}
</style> 