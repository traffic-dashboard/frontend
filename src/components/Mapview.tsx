// src/components/MapView.tsx
import React, { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import styled from '@emotion/styled'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'

// 기본 마커 아이콘 설정
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

// 조회 가능한 이벤트 타입 정의
type Category = 'all' | 'acc' | 'cor' | 'wea' | 'ete' | 'dis' | 'etc'

interface TrafficEvent {
  eventType: string
  eventDetailType: string
  startDate: string
  coordX: string
  coordY: string
}

interface MapViewProps {
  onMarkerClick: (lat: number, lng: number) => void
}

export default function MapView({ onMarkerClick }: MapViewProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [events, setEvents] = useState<TrafficEvent[]>([])

  // 버튼 클릭 시 activeCategory가 바뀌면 이 useEffect가 재실행됩니다.
  useEffect(() => {
    fetch(`/traffic-events?eventType=${activeCategory}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        // FastAPI에서 { events: [...] } 형태로 응답한다고 가정
        const list: TrafficEvent[] = Array.isArray(data.events) ? data.events : []
        setEvents(list)
      })
      .catch(console.error)
  }, [activeCategory])

  // 각 타입에 대한 버튼 라벨 매핑
  const labelsMap: Record<Category, string> = {
    all: 'All',
    acc: 'Accident',
    cor: 'Construction',
    wea: 'Weather',
    ete: 'Other Incident',
    dis: 'Disaster',
    etc: 'Etc.'
  }

  return (
    <Container>
      <LegendBar>
        {(
          ['all','acc','cor','wea','ete','dis','etc'] as Category[]
        ).map(cat => (
          <LegendItem
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {labelsMap[cat]}
          </LegendItem>
        ))}
      </LegendBar>

      <MapWrapper>
        <MapContainer
          center={[36.5, 127.5]}
          zoom={7}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {events.map((ev, idx) => {
            const lat = parseFloat(ev.coordY)
            const lng = parseFloat(ev.coordX)
            return (
              <Marker
                key={idx}
                position={[lat, lng]}
                eventHandlers={{ click: () => onMarkerClick(lat, lng) }}
              />
            )
          })}
        </MapContainer>
      </MapWrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

const LegendBar = styled.div`
  display: flex;
  gap: 16px;
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 8px 16px;
`

const LegendItem = styled.div<{ active: boolean }>`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ active }) => (active ? '#FCE4EC' : 'transparent')};
  color: ${({ active }) => (active ? '#D81B60' : '#555')};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  user-select: none;
`

const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
`
