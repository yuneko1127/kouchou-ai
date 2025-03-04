import {RadioCardItem, RadioCardRoot} from '@/components/ui/radio-card'
import {Button, HStack, Icon, useBreakpointValue} from '@chakra-ui/react'
import {
  ChartScatterIcon, FlameIcon,
  SquareSquareIcon, ZoomInIcon
} from 'lucide-react'
import React from 'react'
import {Tooltip} from '@/components/ui/tooltip'

type Props = {
  selected: string
  onChange: (value: string) => void
  onClickClusterSetting: () => void
  onClickDensitySetting: () => void
  isApplyClusterFilter: boolean
}

export function SelectChartButton({selected, onChange, onClickClusterSetting, onClickDensitySetting, isApplyClusterFilter}: Props) {
  return (
    <HStack w={'100%'} justify={'center'} align={'center'} mb={10}>
      <RadioCardRoot
        orientation="horizontal"
        align="center"
        justify="center"
        w={'100%'}
        maxW={'xl'}
        size={'sm'}
        display={'block'}
        value={selected}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        colorPalette={'cyan'}
      >
        <HStack align={'stretch'}>
          <RadioCardItem
            value={'scatterAll'}
            label={useBreakpointValue({ base: '', md: '全体図' })}
            indicator={false}
            icon={<Icon><ChartScatterIcon /></Icon>}
            cursor={'pointer'}
          />
          <RadioCardItem
            value={'scatterDensity'}
            label={useBreakpointValue({ base: '', md: '濃いクラスタ' })}
            indicator={false}
            icon={<Icon><ChartScatterIcon /></Icon>}
            cursor={'pointer'}
          />
          <RadioCardItem
            value={'treemap'}
            label={useBreakpointValue({ base: '', md: 'ツリーマップ' })}
            indicator={false}
            icon={<Icon><SquareSquareIcon /></Icon>}
            cursor={'pointer'}
          />
        </HStack>
      </RadioCardRoot>
      <Tooltip content={isApplyClusterFilter ? '表示クラスタ設定が有効です' : '表示クラスタ設定'} openDelay={0} closeDelay={0}>
        <Button
          onClick={onClickClusterSetting}
          variant={isApplyClusterFilter ? 'solid' : 'outline'}
          h={'50px'}
        >
          <Icon><ZoomInIcon /></Icon>
        </Button>
      </Tooltip>
      <Tooltip content={'濃いクラスタ設定'} openDelay={0} closeDelay={0}>
        <Button
          onClick={onClickDensitySetting}
          variant={'outline'}
          h={'50px'}
        >
          <Icon><FlameIcon /></Icon>
        </Button>
      </Tooltip>
    </HStack>
  )
}
