// src/data/dummyTrafficData.ts

export interface HourlyData {
  hour: string;      // "00" ~ "23"
  traffic: number;   // 대략 50~300 범위
  speed: number;     // 대략 30~80 범위
}

export interface RegionTraffic {
  date: string;           // YYYY-MM-DD
  region: string;         // ex. "서울"
  hourly: HourlyData[];   // 24개 항목
}

// ◼️ 허용된 모든 지역
const ALL_REGIONS = [
  '서울','청주','전주','광주','서해안','부산',
  '강원','경기','대전','대구','천안'
]

// ◼️ 더미를 생성할 날짜들
const DATES = ['2025-05-26','2025-05-27']

// ◼️ 실제 더미 데이터 배열
export const dummyTrafficData: RegionTraffic[] = DATES.flatMap(date =>
  ALL_REGIONS.map(region => ({
    date,
    region,
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0')
      const dateOffset = DATES.indexOf(date)
      const regionOffset = ALL_REGIONS.indexOf(region)
      const baseTraffic = 80 + regionOffset * 5 + dateOffset * 10
      const baseSpeed   = 40 + regionOffset * 2 - dateOffset * 1

      return {
        hour,
        traffic: Math.round(
          baseTraffic +
          50 * Math.sin((i / 24) * Math.PI) +
          Math.random() * 30
        ),
        speed: Math.round(
          baseSpeed +
          20 * Math.cos((i / 24) * Math.PI) +
          Math.random() * 10
        )
      }
    })
  }))
)
