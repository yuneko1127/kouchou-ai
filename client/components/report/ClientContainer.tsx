'use client'

import {Chart} from '@/components/report/Chart'
import {Analysis} from '@/components/report/Analysis'
import React, {PropsWithChildren, useEffect, useState} from 'react'
import {Skeleton} from '@/components/ui/skeleton'
import {Cluster, Result} from '@/type'
import {LoadingBar} from '@/components/report/LoadingBar'
import {FilterSettingDialog} from '@/components/report/FilterSettingDialog'
import {ClusterOverview} from '@/components/report/ClusterOverview'
import {SelectChartButton} from '@/components/charts/SelectChartButton'
import {ClusterBreadcrumb} from '@/components/report/ClusterBreadcrumb'

type Props = {
  reportName: string
  resultSize: number
}

export function ClientContainer({reportName, resultSize, children}: PropsWithChildren<Props>) {
  const [loadedSize, setLoadedSize] = useState(0)
  const [result, setResult] = useState<Result>()
  const [rootLevel, setRootLevel] = useState(0)
  const [filteredResult, setFilteredResult] = useState<Result>()
  const [selectedClusters, setSelectedClusters] = useState<Cluster[]>([])
  const [openFilterSetting, setOpenFilterSetting] = useState(false)
  const [selectedChart, setSelectedChart] = useState('scatter')
  const [maxDensity, setMaxDensity] = useState<number>(1)
  const [minValue, setMinValue] = useState<number>(0)

  useEffect(() => {
    fetchReport()
  }, [])

  function onChangeFilter(maxDensity: number, minValue: number, lv1: string, lv2: string, lv3: string, lv4: string) {
    if (!result) return
    setRootLevel(getRootLevel(lv1, lv2, lv3, lv4))
    setSelectedClusters(getSelectedClusters(result.clusters || [], lv1, lv2, lv3, lv4))
    setFilteredResult({
      ...result,
      clusters: getFilteredClusters(result.clusters || [], maxDensity, minValue, lv1, lv2, lv3, lv4)
    })
  }

  async function fetchReport() {
    const response = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + `/reports/${reportName}`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      }
    })
    const reader = response.body?.getReader()
    let loaded = 0
    if (reader) {
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        loaded += value.length
        setLoadedSize(loaded)
      }
      const concatenatedChunks = new Uint8Array(loaded)
      let position = 0
      for (const chunk of chunks) {
        concatenatedChunks.set(chunk, position)
        position += chunk.length
      }
      const result = new TextDecoder('utf-8').decode(concatenatedChunks)
      const r: Result = JSON.parse(result)
      setResult(r)
      setFilteredResult(r)
    }
  }

  if (!result || !filteredResult) {
    return (
      <>
        <LoadingBar loaded={loadedSize} max={resultSize} />
        <Skeleton height="534px" mb={5} mx={'auto'} w={'100%'} maxW={'1200px'} />
        { children }
        <LoadingBar loaded={loadedSize} max={resultSize} />
      </>
    )
  }
  return (
    <>
      {openFilterSetting && (
        <FilterSettingDialog
          result={result}
          selectedClusters={selectedClusters}
          onClose={() => {setOpenFilterSetting(false)}}
          onChangeFilter={(maxDensity, minValue, level1, level2, level3, level4) => {
            setMaxDensity(maxDensity)
            setMinValue(minValue)
            onChangeFilter(maxDensity, minValue, level1, level2, level3, level4)
          }}
          currentMaxDensity={maxDensity}
          currentMinValue={minValue}
        />
      )}
      <Chart
        result={filteredResult}
        rootLevel={rootLevel}
        selectedChart={selectedChart}
      />
      <SelectChartButton
        selected={selectedChart}
        onChange={setSelectedChart}
        onClickSetting={() => {setOpenFilterSetting(true)}}
        isApplyFilter={result.clusters.length !== filteredResult.clusters.length || maxDensity !== 1 || minValue !== 0}
      />
      <ClusterBreadcrumb
        selectedClusters={selectedClusters}
        onChangeFilter={(level1, level2, level3, level4) => {onChangeFilter(maxDensity, minValue, level1, level2, level3, level4)}}
      />
      { rootLevel === 0 && children }
      { rootLevel !== 0 && (
        filteredResult.clusters.filter(c => c.level === rootLevel + 1).map(c => (
          <ClusterOverview key={c.id} cluster={c} />
        ))
      )}
      <Analysis result={result} />
    </>
  )
}

function getRootLevel(level1Id:string, level2Id:string, level3Id:string, level4Id:string) {
  if (level4Id !== '0') return 4
  if (level3Id !== '0') return 3
  if (level2Id !== '0') return 2
  if (level1Id !== '0') return 1
  return 0
}

function getSelectedClusters(clusters: Cluster[], level1Id:string, level2Id:string, level3Id:string, level4Id:string): Cluster[] {
  const results: Cluster[] = []
  if (level1Id !== '0') results.push(clusters.find(c => c.id === level1Id)!)
  if (level2Id !== '0') results.push(clusters.find(c => c.id === level2Id)!)
  if (level3Id !== '0') results.push(clusters.find(c => c.id === level3Id)!)
  if (level4Id !== '0') results.push(clusters.find(c => c.id === level4Id)!)
  return results
}

function getFilteredClusters(clusters: Cluster[], maxDensity: number, minValue: number, level1Id:string, level2Id:string, level3Id:string, level4Id:string): Cluster[] {
  if (level4Id !== '0') {
    const lv1cluster = clusters.find(c => c.id === level1Id)!
    const lv2cluster = clusters.find(c => c.id === level2Id)!
    const lv3cluster = clusters.find(c => c.id === level3Id)!
    const lv4cluster = clusters.find(c => c.id === level4Id)!
    const lv5clusters = clusters.filter(c => c.parent === level4Id)
    const filtered = [lv1cluster, lv2cluster, lv3cluster, lv4cluster, ...lv5clusters]
    return getDenseClusters(filtered, maxDensity, minValue)
  }
  if (level3Id !== '0') {
    const lv1cluster = clusters.find(c => c.id === level1Id)!
    const lv2cluster = clusters.find(c => c.id === level2Id)!
    const lv3cluster = clusters.find(c => c.id === level3Id)!
    const lv4clusters = clusters.filter(c => c.parent === level3Id)
    const lv5clusters = clusters.filter(c => lv4clusters.some(lv4 => lv4.id === c.parent))
    const filtered = [lv1cluster, lv2cluster, lv3cluster, ...lv4clusters, ...lv5clusters]
    return getDenseClusters(filtered, maxDensity, minValue)
  }
  if (level2Id !== '0') {
    const lv1cluster = clusters.find(c => c.id === level1Id)!
    const lv2cluster = clusters.find(c => c.id === level2Id)!
    const lv3clusters = clusters.filter(c => c.parent === level2Id)
    const lv4clusters = clusters.filter(c => lv3clusters.some(lv3 => lv3.id === c.parent))
    const lv5clusters = clusters.filter(c => lv4clusters.some(lv4 => lv4.id === c.parent))
    const filtered = [lv1cluster, lv2cluster, ...lv3clusters, ...lv4clusters, ...lv5clusters]
    return getDenseClusters(filtered, maxDensity, minValue)
  }
  if (level1Id !== '0') {
    const lv1cluster = clusters.find(c => c.id === level1Id)!
    const lv2clusters = clusters.filter(c => c.parent === level1Id)
    const lv3clusters = clusters.filter(c => lv2clusters.some(lv2 => lv2.id === c.parent))
    const lv4clusters = clusters.filter(c => lv3clusters.some(lv3 => lv3.id === c.parent))
    const lv5clusters = clusters.filter(c => lv4clusters.some(lv4 => lv4.id === c.parent))
    const filtered = [lv1cluster, ...lv2clusters, ...lv3clusters, ...lv4clusters, ...lv5clusters]
    return getDenseClusters(filtered, maxDensity, minValue)
  }
  return getDenseClusters(clusters, maxDensity, minValue)
}

function getDenseClusters(clusters: Cluster[], maxDensity: number, minValue: number): Cluster[] {
  const deepestLevel = clusters.reduce((maxLevel, cluster) => Math.max(maxLevel, cluster.level), 0)
  return [
    ...clusters.filter(c => c.level !== deepestLevel),
    ...clusters.filter(c => c.level === deepestLevel).filter(c => c.density_rank_percentile <= maxDensity).filter(c => c.value >= minValue)
  ]
}
