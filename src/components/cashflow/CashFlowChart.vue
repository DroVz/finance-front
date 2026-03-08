<template>
  <div class="cash-flow-chart">
    <div class="chart-header">
      <h3 class="section-title">📊 Évolution du Cash Flow mensuel</h3>
      <div class="chart-range-selector">
        <button
          v-for="option in rangeOptions"
          :key="option.value"
          class="range-btn"
          :class="{ active: chartMonths === option.value }"
          @click="emit('changeRange', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="monthlyData.length > 0" class="chart-container">
      <apexchart
        type="line"
        height="400"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <div v-else class="empty-state">
      <p>Aucune donnée disponible pour le graphique</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MonthlyCashFlow } from '@/types';
import { useFormatters } from '@/composables/useFormatters';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  monthlyData: MonthlyCashFlow[]
  chartMonths: number
  selectedMonth?: string  // format YYYY-MM
}>();

const emit = defineEmits<{
  changeRange: [months: number]
  selectMonth: [month: string]
}>();

const rangeOptions = [
  { label: '6 mois', value: 6 },
  { label: '1 an', value: 12 },
  { label: '2 ans', value: 24 },
  { label: '3 ans', value: 36 }
];

const { formatCurrency } = useFormatters();
const { isDark } = useTheme();

// Index du mois sélectionné dans les données du graphique
const selectedIndex = computed(() => {
  if (!props.selectedMonth) return -1;
  const [year, month] = props.selectedMonth.split('-').map(Number);
  return props.monthlyData.findIndex(d => d.year === year && d.month === month);
});

// Préparer les données pour le graphique
const chartSeries = computed(() => [
  {
    name: 'Cash Flow',
    data: props.monthlyData.map(d => d.cashFlow)
  }
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    background: 'transparent',
    foreColor: isDark.value ? '#9ca3af' : '#6b7280',
    events: {
      markerClick: (_event: any, _ctx: any, config: any) => {
        const data = props.monthlyData[config.dataPointIndex];
        if (data) {
          emit('selectMonth', `${data.year}-${String(data.month).padStart(2, '0')}`);
        }
      }
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  colors: ['#2563eb'],
  stroke: {
    curve: 'smooth',
    width: 4
  },
  markers: {
    size: props.monthlyData.map((_, i) => i === selectedIndex.value ? 10 : 6),
    colors: [isDark.value ? '#1f2937' : '#fff'],
    strokeColors: props.monthlyData.map((d, i) =>
      i === selectedIndex.value ? '#2563eb' : (d.cashFlow >= 0 ? '#10b981' : '#ef4444')
    ),
    strokeWidth: props.monthlyData.map((_, i) => i === selectedIndex.value ? 4 : 3),
    hover: {
      size: 8,
      cursor: 'pointer'
    }
  },
  xaxis: {
    categories: props.monthlyData.map(d => d.monthLabel),
    labels: {
      style: {
        colors: isDark.value ? '#9ca3af' : '#6b7280',
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatCurrency(value),
      style: {
        colors: isDark.value ? '#9ca3af' : '#6b7280',
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    }
  },
  tooltip: {
    custom: ({ series, seriesIndex, dataPointIndex }: any) => {
      const data = props.monthlyData[dataPointIndex];
      const cashFlow = series[seriesIndex][dataPointIndex];
      const isPositive = cashFlow >= 0;

      return `
        <div class="apex-tooltip">
          <div class="tooltip-title">${data.monthLabel}</div>
          <div class="tooltip-row">
            <span class="tooltip-label">📈 Revenus:</span>
            <span class="tooltip-value income">${formatCurrency(data.income)}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">📉 Dépenses:</span>
            <span class="tooltip-value expense">${formatCurrency(data.expenses)}</span>
          </div>
          <div class="tooltip-divider"></div>
          <div class="tooltip-row">
            <span class="tooltip-label">💰 Cash Flow:</span>
            <span class="tooltip-value ${isPositive ? 'positive' : 'negative'}">${formatCurrency(cashFlow)}</span>
          </div>
          <div class="tooltip-message">${isPositive ? '✅ Mois positif' : '⚠️ Mois négatif'}</div>
        </div>
      `;
    }
  },
  grid: {
    borderColor: isDark.value ? '#374151' : '#e5e7eb',
    strokeDashArray: 4
  },
  annotations: {
    yaxis: [
      {
        y: 0,
        borderColor: '#9ca3af',
        strokeDashArray: 0,
        borderWidth: 2,
        label: {
          text: 'Équilibre',
          style: {
            color: '#fff',
            background: '#6b7280',
            fontSize: '11px'
          }
        }
      }
    ]
  },
  dataLabels: {
    enabled: false
  }
}));
</script>

<style scoped>
.cash-flow-chart {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 32px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.chart-range-selector {
  display: flex;
  gap: 6px;
}

.range-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  font-size: 13px;
  font-family: inherit;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.range-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.chart-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .cash-flow-chart {
    padding: 16px;
  }

  .chart-container {
    min-height: 300px;
  }
}
</style>

<style>
/* Styles globaux pour le tooltip ApexCharts */
.apex-tooltip {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: inherit;
  min-width: 200px;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2937;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0;
  font-size: 13px;
}

.tooltip-label {
  color: #6b7280;
  font-weight: 500;
}

.tooltip-value {
  font-weight: 700;
  margin-left: 12px;
}

.tooltip-value.income {
  color: #10b981;
}

.tooltip-value.expense {
  color: #ef4444;
}

.tooltip-value.positive {
  color: #059669;
}

.tooltip-value.negative {
  color: #dc2626;
}

.tooltip-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

.tooltip-message {
  margin-top: 6px;
  font-size: 11px;
  text-align: center;
  font-weight: 600;
  padding: 4px;
  border-radius: 4px;
  background: #f3f4f6;
}

/* Dark mode overrides for tooltip */
[data-theme="dark"] .apex-tooltip {
  background: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .tooltip-title {
  color: #f9fafb;
  border-bottom-color: #374151;
}

[data-theme="dark"] .tooltip-label {
  color: #9ca3af;
}

[data-theme="dark"] .tooltip-divider {
  background: #374151;
}

[data-theme="dark"] .tooltip-message {
  background: #374151;
  color: #d1d5db;
}
</style>
