import {Result} from '@/type'
import {ScatterChart} from '@/components/charts/ScatterChart'
import {TreemapChart} from '@/components/charts/TreemapChart'
import {Box} from '@chakra-ui/react'

type ReportProps = {
  result: Result
  selectedChart: string
}

export function Chart({result, selectedChart}: ReportProps) {
  return (
    <Box mx={'auto'} w={'100%'} maxW={'1200px'}>
      <Box h={'500px'} mb={5}>
        {selectedChart === 'treemap' && (
          <TreemapChart
            clusterList={result.clusters}
            argumentList={result.arguments}
          />
        )}
        {selectedChart === 'scatterAll' && (
          <ScatterChart
            clusterList={result.clusters}
            argumentList={result.arguments}
            targetLevel={1}
          />
        )}
        {selectedChart === 'scatterDensity' && (
          <ScatterChart
            clusterList={result.clusters}
            argumentList={result.arguments}
            targetLevel={Math.max(...result.clusters.map(c => c.level))}
          />
        )}
      </Box>
    </Box>
  )
}
