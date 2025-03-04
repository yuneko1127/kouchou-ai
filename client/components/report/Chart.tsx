import {Result} from '@/type'
import {ScatterChart} from '@/components/charts/ScatterChart'
import {TreemapChart} from '@/components/charts/TreemapChart'
import {Box} from '@chakra-ui/react'

type ReportProps = {
  result: Result
  rootLevel: number
  selectedChart: string
}

export function Chart({result, rootLevel, selectedChart}: ReportProps) {
  return (
    <Box mx={'auto'} w={'100%'} maxW={'1200px'}>
      <Box h={'500px'} mb={5}>
        {selectedChart === 'treemap' && (
          <TreemapChart clusterList={result.clusters} argumentList={result.arguments} rootLevel={rootLevel}  />
        )}
        {selectedChart === 'scatterAll' && (
          <ScatterChart clusterList={result.clusters} argumentList={result.arguments} rootLevel={rootLevel} />
        )}
        {selectedChart === 'scatterDensity' && (
          <ScatterChart clusterList={result.clusters} argumentList={result.arguments} rootLevel={rootLevel} />
        )}
      </Box>
    </Box>
  )
}
