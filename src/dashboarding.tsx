// src/pages/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'

import Sidebar from './components/Sibebar'
import Chart from './components/Chart'
import MapView from './components/Mapview'
import DailyAccidentChart from './components/DailyAccidentChart'
import CCTVComponent from './components/CCTV'
import { dummyTrafficData } from './data/dummyTrafficData'

type RegionTraffic = typeof dummyTrafficData[number]

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
  padding: 24px;
  background-color: #f7f8fa;
  height: 100vh;
  box-sizing: border-box;
`
const Section = styled.div`
  display: flex;
  flex-direction: column;
`
const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #7e57c2;
`
const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
const MapWrapper = styled(Card)`
  padding: 0;
  & > .leaflet-container {
    flex: 1;
    width: 100%;
    height: 100%;
  }
`

type CCTVItem = {
  coordx: string
  coordy: string
  cctvurl: string
  cctvname: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const region    = searchParams.get('region') || ''
  const view      = (searchParams.get('view') as 'daily' | 'monthly') ?? 'daily'
  const dateParam = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const baseDate  = new Date(dateParam)

  // 1) 당월 일수 구하기
  const daysInMonth = useMemo(() => {
    const y = baseDate.getFullYear()
    const m = baseDate.getMonth() + 1
    return new Date(y, m, 0).getDate()
  }, [baseDate])

  // 2) 지역별 월간 사고율 더미 생성(useMemo)
  const monthlyAccidentRates = useMemo<number[]>(() => {
    if (!region) return []
    return Array.from({ length: daysInMonth }, () =>
      Math.round(20 + Math.random() * 60)
    )
  }, [region, daysInMonth])

  // 3) 9일 윈도우(기준일 -4 ~ +4) 레이블/데이터 계산
  const { labels: winLabels, data: winData } = useMemo(() => {
    const windowSize = 9
    const half = Math.floor(windowSize / 2) // 4
    const labels: string[] = []
    const data: number[]   = []

    for (let i = 0; i < windowSize; i++) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + (i - half))
      const day = d.getDate()
      labels.push(`${day}일`)                // ★ 포맷 수정
      data.push(monthlyAccidentRates[day - 1] ?? 0)
    }

    return { labels, data }
  }, [baseDate, monthlyAccidentRates])

  // Daily 교통량/속도 더미
  const [dailyTraffic, setDailyTraffic] = useState<number[]>([])
  const [speedData,     setSpeedData]   = useState<number[]>([])
  // src/pages/Dashboard.tsx

useEffect(() => {
  if (view !== 'daily' || !region) {
    setDailyTraffic([])
    setSpeedData([])
    return
  }

  // 1) 먼저 기존 더미에서 찾고
  let entry = dummyTrafficData.find(
    d => d.region === region && d.date === dateParam
  )

  // 2) 없으면 “동적 생성” 해서 entry 에 할당
  if (!entry) {
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour:    i.toString().padStart(2, '0'),
      traffic: Math.round(80 + Math.random() * 80),
      speed:   Math.round(30 + Math.random() * 50),
    }))
    entry = { date: dateParam, region, hourly }
  }

  // 3) state 업데이트
  setDailyTraffic(entry.hourly.map(h => h.traffic))
  setSpeedData(  entry.hourly.map(h => h.speed)    )

}, [region, view, dateParam])


  // CCTV nearest
  const [selectedCCTV, setSelectedCCTV] = useState<CCTVItem | null>(null)
  const fetchNearest = async (lat: number, lng: number) => {
    setSelectedCCTV(null)
    try {
      const res = await fetch(
        `http://localhost:8001/api/nearest-cctv?lat=${lat}&lng=${lng}`
      )
      const json = await res.json()
      if (res.ok && !json.error) setSelectedCCTV(json as CCTVItem)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <PageWrapper>
      {/* Daily 탭 */}
      <Section>
        <SectionTitle>Daily</SectionTitle>
        <Card>
          <Chart
            trafficData={dailyTraffic}
            speedData={speedData}
            vehicleShare={{
              labels: [], data: [], icons: []
            }}
          />
        </Card>
      </Section>

      {/* Monthly 탭 */}
      <Section>
        <SectionTitle>Monthly</SectionTitle>
        <MapWrapper>
          <MapView onMarkerClick={fetchNearest} />
        </MapWrapper>

        <SectionTitle>Daily Accident Rate</SectionTitle>
        <DailyAccidentChart
          region={region}
          labels={winLabels}
          data={winData}
        />
      </Section>

      {/* Area */}
      <Section>
        <SectionTitle>Area</SectionTitle>
        <Sidebar />
      </Section>

      {/* CCTV */}
      <Section>
        <SectionTitle>CCTV Viewer</SectionTitle>
        <Card>
          <CCTVComponent cctv={selectedCCTV} />
        </Card>
      </Section>
    </PageWrapper>
  )
}
