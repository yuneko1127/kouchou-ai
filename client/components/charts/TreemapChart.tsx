import {Argument, Cluster} from '@/type'
import {PlotData} from 'plotly.js'
import React from 'react'
import {ChartCore} from './ChartCore'

type Props = {
  clusterList: Cluster[]
  argumentList: Argument[]
}

export function TreemapChart({clusterList, argumentList}: Props) {
  const convertedArgumentList = argumentList.map(convertArgumentToCluster)
  const list = [
    { ...clusterList[0], parent: '' },
    ...clusterList.slice(1),
    ...convertedArgumentList
  ]
  const ids = list.map(node => node.id)
  const labels = list.map(node => node.label)
  const parents = list.map(node => node.parent)
  const values = list.map(node => node.value)
  const data: Partial<PlotData & {maxdepth: number, pathbar: { thickness: number }}> = {
    type: 'treemap',
    ids: ids,
    labels: labels,
    parents: parents,
    values: values,
    branchvalues: 'total',
    hovertemplate: '<b>%{label}</b><br>%{value:,}件<br>%{percentEntry:.2%}<extra></extra>',
    texttemplate: '%{label}<br>%{percentEntry:.2%}',
    maxdepth: 2,
    pathbar: {
      thickness: 28,
    },
  }

  const layout = {
    margin: { l: 0, r: 0, b: 0, t: 30 },
    colorway: ['#b4d8a4','#f3c7d8','#d6e5ef','#f9ebc3','#83b6c7'],
  }

  return (
    <ChartCore
      data={[data]}
      layout={layout}
      useResizeHandler={true}
      style={{width: '100%', height: '100%'}}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
    />
  )
}

function convertArgumentToCluster(argument: Argument): Cluster {
  return {
    level: 3,
    id: argument.arg_id,
    label: argument.argument,
    takeaway: '',
    value: 1,
    parent: argument.cluster_ids[2],
    density_rank_percentile: 0
  }
}
