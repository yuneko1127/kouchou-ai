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
    {...clusterList[0], parent: ''},
    ...clusterList.slice(1),
    ...convertedArgumentList
  ]
  const ids = list.map(node => node.id)
  const labels = list.map(node => node.label.replace(/(.{15})/g, '$1<br />'))
  const parents = list.map(node => node.parent)
  const values = list.map(node => node.value)
  const data: Partial<PlotData & { maxdepth: number, pathbar: { thickness: number } }> = {
    type: 'treemap',
    ids: ids,
    labels: labels,
    parents: parents,
    values: values,
    branchvalues: 'total',
    hovertemplate: '<b>%{label}</b><br>%{value:,}件<br>%{percentEntry:.2%}<extra></extra>',
    texttemplate: '%{label}<br>%{value:,}件<br>%{percentEntry:.2%}',
    maxdepth: 2,
    pathbar: {
      thickness: 28,
    },
  }

  const layout = {
    margin: {l: 10, r: 10, b: 10, t: 30},
    colorway: ['#b3daa1', '#f5c5d7', '#d5e5f0', '#fbecc0', '#80b8ca', '#dabeed', '#fad1af', '#fbb09d', '#a6e3ae', '#f1e4d6'],
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
        locale: 'ja',
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
