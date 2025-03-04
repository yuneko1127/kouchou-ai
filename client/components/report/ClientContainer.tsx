'use client'

import {Chart} from '@/components/report/Chart'
import {Analysis} from '@/components/report/Analysis'
import React, {PropsWithChildren, useEffect, useState} from 'react'
import {Skeleton} from '@/components/ui/skeleton'
import {Cluster, Result} from '@/type'
import {LoadingBar} from '@/components/report/LoadingBar'
import {ClusterFilterSettingDialog} from '@/components/report/ClusterFilterSettingDialog'
import {ClusterOverview} from '@/components/report/ClusterOverview'
import {SelectChartButton} from '@/components/charts/SelectChartButton'
import {ClusterBreadcrumb} from '@/components/report/ClusterBreadcrumb'
import {DensityFilterSettingDialog} from '@/components/report/DensityFilterSettingDialog'

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
  const [openClusterFilterSetting, setOpenClusterFilterSetting] = useState(false)
  const [openDensityFilterSetting, setOpenDensityFilterSetting] = useState(false)
  const [selectedChart, setSelectedChart] = useState('scatterAll')
  const [maxDensity, setMaxDensity] = useState(0.5)
  const [minValue, setMinValue] = useState(5)

  useEffect(() => {
    fetchReport()
  }, [])

  function updateFilteredResult(maxDensity: number, minValue: number, selectedClusters: Cluster[]) {
    if (!result) return
    setFilteredResult({
      ...result,
      clusters: getFilteredClusters(
        result.clusters || [],
        maxDensity,
        minValue,
        selectedClusters[0]?.id || '0',
        selectedClusters[1]?.id || '0',
        selectedClusters[2]?.id || '0',
        selectedClusters[3]?.id || '0'
      )
    })
  }

  function onChangeClusterFilter(lv1: string, lv2: string, lv3: string, lv4: string) {
    setRootLevel(getRootLevel(lv1, lv2, lv3, lv4))
    const selectedClusters = getSelectedClusters(result?.clusters || [], lv1, lv2, lv3, lv4)
    setSelectedClusters(selectedClusters)
    updateFilteredResult(maxDensity, minValue, selectedClusters)
  }

  function onChangeDensityFilter(maxDensity: number, minValue: number) {
    setMaxDensity(maxDensity)
    setMinValue(minValue)
    if (selectedChart !== 'scatterAll') {
      updateFilteredResult(maxDensity, minValue, selectedClusters)
    }
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
      {openClusterFilterSetting && (
        <ClusterFilterSettingDialog
          result={result}
          selectedClusters={selectedClusters}
          onClose={() => {setOpenClusterFilterSetting(false)}}
          onChangeFilter={onChangeClusterFilter}
        />
      )}
      {openDensityFilterSetting && (
        <DensityFilterSettingDialog
          currentMaxDensity={maxDensity}
          currentMinValue={minValue}
          onClose={() => {setOpenDensityFilterSetting(false)}}
          onChangeFilter={onChangeDensityFilter}
        />
      )}
      <Chart
        result={filteredResult}
        rootLevel={rootLevel}
        selectedChart={selectedChart}
      />
      <SelectChartButton
        selected={selectedChart}
        onChange={(selectedChart) => {
          setSelectedChart(selectedChart)
          if (selectedChart === 'scatterAll') {
            updateFilteredResult(1, 0, selectedClusters)
          }
          if (selectedChart === 'scatterDensity' || selectedChart === 'treemap') {
            updateFilteredResult(maxDensity, minValue, selectedClusters)
          }
        }}
        onClickClusterSetting={() => {setOpenClusterFilterSetting(true)}}
        onClickDensitySetting={() => {setOpenDensityFilterSetting(true)}}
        isApplyClusterFilter={rootLevel !== 0}
      />
      <ClusterBreadcrumb
        selectedClusters={selectedClusters}
        onChangeFilter={(level1, level2, level3, level4) => {
          onChangeClusterFilter(level1, level2, level3, level4)
        }}
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
