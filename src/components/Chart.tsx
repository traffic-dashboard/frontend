// src/components/Chart.tsx
import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartJsTitle,
  Tooltip,
  Legend as ChartJsLegend,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Line, Pie } from 'react-chartjs-2'
import styled from '@emotion/styled'
import { useSearchParams } from 'react-router-dom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartJsTitle,
  Tooltip,
  ChartJsLegend,
  annotationPlugin,
  ChartDataLabels,
)

// 지역별 기본 분포 (합 = 100)
const BASE_SHARE: Record<string, number[]> = {
  서울: [30, 20, 15, 35],
  부산: [25, 25, 15, 35],
  대구: [28, 22, 18, 32],
  인천: [27, 23, 16, 34],
  경기: [32, 18, 14, 36],
  광주: [26, 24, 14, 36],
  대전: [24, 26, 16, 34],
  강원: [22, 28, 18, 32],
  충북: [23, 27, 17, 33],
  충남: [21, 29, 19, 31],
  전북: [20, 30, 20, 30],
  전남: [19, 31, 21, 29],
  경북: [18, 32, 22, 28],
  경남: [17, 33, 23, 27],
  제주: [16, 34, 24, 26],
}

interface ChartProps {
  trafficData: number[]
  speedData:   number[]
}

function formatLabel(h: number) {
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 === 0 ? 12 : h % 12
  return `${h12}${ampm}`
}

export default function Chart({
  trafficData = Array(24).fill(null),
  speedData   = Array(24).fill(null),
}: ChartProps) {
  const [searchParams] = useSearchParams()

  // URL에서 hour=HH:00, date=YYYY-MM-DD 읽어오기
  const hourParam = searchParams.get('hour') || `${new Date().getHours()}:00`
  const selectedHour = parseInt(hourParam.split(':')[0], 10)

  const dateParam = searchParams.get('date')
    || new Date().toISOString().slice(0,10)
  const weekday = new Date(dateParam).getDay()  // 0=Sun,1=Mon...

  const region = searchParams.get('region') || '서울'

  // ────────────────────────────────────────────────
  // 1) 과거 10시간 → 현재 시점 Line 차트 데이터
  const windowSize = 10
  const labels: string[]              = []
  const histTraffic:  (number|null)[] = []
  const histSpeed:    (number|null)[] = []
  const currentIdx = windowSize

  for (let offset = -windowSize; offset <= 0; offset++) {
    const h = (selectedHour + offset + 24) % 24
    labels.push(formatLabel(h))
    histTraffic.push(trafficData[h])
    histSpeed.push(speedData[h])
  }

  // ────────────────────────────────────────────────
  // 2) Pie 차트용 목데이터: region + hour + weekday 반영
  const [pieState, setPieState] = useState<{
    labels: string[]
    data:   number[]
    icons:  string[]
  }>({ labels: [], data: [], icons: [] })

  useEffect(() => {
    // 1) region 기본값
    const base = BASE_SHARE[region] || BASE_SHARE['서울']
    // 2) (hour + weekday) 만큼 회전
    const offset = (selectedHour + weekday) % base.length
    const rotated = base.slice(offset).concat(base.slice(0, offset))
    // 3) 랜덤 노이즈 ±5 추가
    let noisy = rotated.map(v => v + Math.round(Math.random()*10 - 5))
    noisy = noisy.map(v => Math.max(v, 0))
    // 4) 100% 정규화
    const sum = noisy.reduce((a,b) => a+b, 0) || 1
    const percents = noisy.map(v => Math.round((v/sum)*100))
    const diff = 100 - percents.reduce((a,b) => a + b, 0)
    percents[percents.length - 1] += diff

    setPieState({
      labels: ['Passenger Car','Motorcycle','Bus','Freight Vehicle'],
      data:   percents,
      icons: [
        '/icons/passenger.svg',
        '/icons/motorcycle.svg',
        '/icons/bus.svg',
        '/icons/freight.svg'
      ]
    })
  }, [region, selectedHour, weekday])

  // ────────────────────────────────────────────────
  // 차트 옵션
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
      annotation: {
        annotations: {
          nowLine: {
            type:      'line' as const,
            xMin:      currentIdx,
            xMax:      currentIdx,
            borderColor: '#7E57C2',
            borderWidth: 2
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: true, color: '#eee' },
        ticks: {
          color: (_: any, i: number) =>
            i === currentIdx ? '#7E57C2' : '#999',
          font: (_: any, i: number) => ({
            weight: i === currentIdx ? '700' : '400'
          })
        }
      },
      y: {
        grid: { color: '#eee' },
        ticks: { color: '#999', stepSize: 50, beginAtZero: true }
      }
    },
    layout: { padding: 8 }
  }

  const trafficChartData = {
    labels,
    datasets: [{
      label:           'Average Traffic',
      data:            histTraffic,
      borderColor:     '#7E57C2',
      backgroundColor: 'rgba(126,87,194,0.2)',
      fill:            true,
      tension:         0.4,
      pointRadius:     3
    }]
  }

  const speedChartData = {
    labels,
    datasets: [{
      label:           'Average Speed',
      data:            histSpeed,
      borderColor:     '#7E57C2',
      backgroundColor: 'rgba(126,87,194,0.1)',
      fill:            'start' as const,
      tension:         0.4,
      pointRadius:     3
    }]
  }

  const pieData = {
    labels: pieState.labels,
    datasets: [{
      data:             pieState.data,
      backgroundColor:  ['#7E57C2','#BA68C8','#FFB74D','#E57373'],
      borderWidth:      0,
      hoverOffset:      6,
      datalabels: { color: '#fff' }
    }]
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth:      12,
          padding:       16,
          color:         '#666'
        }
      },
      datalabels: {
        formatter: (value: number, ctx: any) => {
          const dataArr = ctx.chart.data.datasets[0].data as number[]
          const sum     = dataArr.reduce((a,b) => a+b, 0) || 1
          return ((value/sum)*100).toFixed(1) + '%'
        },
        font: { weight: 'bold' }
      }
    }
  }

  return (
    <Wrapper>
      <TwoCols>
        <ChartBox>
          <Title>Average Traffic</Title>
          <ChartArea>
            <Line data={trafficChartData} options={commonOptions}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
            />
          </ChartArea>
        </ChartBox>
        <ChartBox>
          <Title>Average Speed</Title>
          <ChartArea>
            <Line data={speedChartData} options={commonOptions}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
            />
          </ChartArea>
        </ChartBox>
      </TwoCols>
      <PieBox>
        <Title>Traffic Share by Vehicle Type</Title>
        <Pie data={pieData} options={pieOptions} />
      </PieBox>
    </Wrapper>
  )
}

// styled-components
const Wrapper = styled.div`display:flex;flex-direction:column;gap:24px;`
const TwoCols = styled.div`display:grid;grid-template-columns:1fr;gap:24px;`
const ChartBox = styled.div`background:#fff;border-radius:8px;padding:16px;height:260px;position:relative;`
const ChartArea = styled.div`flex:1;position:relative;`
const PieBox   = styled(ChartBox)`width:360px;align-self:flex-start;`
const Title    = styled.h4`margin:0 0 12px;font-size:16px;color:#222;`
