// src/components/DailyAccidentChart.tsx
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styled from '@emotion/styled'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  region: string        // 예: "부산"
  labels: string[]      // 예: ['day18', 'day19', …]
  data: number[]        // 예: [40,55,…]
}

export default function DailyAccidentChart({ region, labels, data }: Props) {
  const lastIdx = labels.length - 1

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        data,
        backgroundColor: labels.map((_, i) =>
          i === lastIdx ? '#D81B60' : 'rgba(232,120,143,0.6)'
        ),
        borderRadius: 4,
        maxBarThickness: 24,
      },
    ],
  }

  const options = {
    indexAxis: 'x' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { weight: '500' } },
      },
      y: {
        grid: { color: '#eee' },
        ticks: { color: '#666', beginAtZero: true, max: 100 },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${region}area's accident`,
        font: { size: 16, weight: '600' },
        padding: { bottom: 12 },
      },
      tooltip: { enabled: false },
    },
  }

  return (
    <ChartWrapper>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  )
}

const ChartWrapper = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 320px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
`
