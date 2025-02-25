import {Box, Button, Heading, Presence, Text, useDisclosure, VStack} from '@chakra-ui/react'
import React, {useState} from 'react'
import {NativeSelectField, NativeSelectRoot} from '@/components/ui/native-select'
import {Cluster, Result} from '@/type'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from '@/components/ui/dialog'
import {ChevronDownIcon} from 'lucide-react'
import {Slider} from '@/components/ui/slider'

type Props = {
  result: Result
  selectedClusters: Cluster[]
  onClose: () => void
  onChangeFilter: (maxDensity: number, minValue: number, level1: string, level2: string, level3: string, level4: string) => void
  currentMaxDensity: number
  currentMinValue: number
}

export function FilterSettingDialog({result, selectedClusters, onClose, onChangeFilter, currentMaxDensity, currentMinValue}: Props) {
  const [level1, setLevel1] = useState<string>(selectedClusters[0]?.id || '0')
  const [level2, setLevel2] = useState<string>(selectedClusters[1]?.id || '0')
  const [level3, setLevel3] = useState<string>(selectedClusters[2]?.id || '0')
  const [level4, setLevel4] = useState<string>(selectedClusters[3]?.id || '0')
  const [maxDensity, setMaxDensity] = useState<number>(currentMaxDensity || 1)
  const [minValue, setMinValue] = useState<number>(currentMinValue || 0)
  const { open, onToggle } = useDisclosure({
    defaultOpen: currentMaxDensity !== 1 || currentMinValue !== 0
  })

  function onChangeLevel(level: number, id: string) {
    switch (level) {
      case 1:
        setLevel1(id)
        setLevel2('0')
        setLevel3('0')
        setLevel4('0')
        break
      case 2:
        setLevel2(id)
        setLevel3('0')
        setLevel4('0')
        break
      case 3:
        setLevel3(id)
        setLevel4('0')
        break
      case 4:
        setLevel4(id)
        break
    }
  }

  function onApply() {
    onChangeFilter(maxDensity, minValue, level1, level2, level3, level4)
    onClose()
  }
  function onReset() {
    setLevel1('0')
    setLevel2('0')
    setLevel3('0')
    setLevel4('0')
    onChangeFilter(1, 0, '0', '0', '0', '0')
    onClose()
  }

  return (
    <DialogRoot lazyMount open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>表示クラスター設定</DialogTitle>
          <Text>表示クラスターを設定すると、分析範囲を絞って詳細を確認できます</Text>
        </DialogHeader>
        <DialogBody>
          <Box>
            <NativeSelectRoot>
              <NativeSelectField
                value={level1}
                onChange={(e) => onChangeLevel(1, e.target.value)}
              >
                <option value={'0'}>全て</option>
                {result.clusters.filter(c => c.level === 1).map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Box>
          {level1 !== '0' && (
            <VStack mt={2}>
              <ChevronDownIcon />
              <NativeSelectRoot>
                <NativeSelectField
                  value={level2}
                  onChange={(e) => onChangeLevel(2, e.target.value)}
                >
                  <option value={'0'}>全て</option>
                  {result.clusters.filter(c => c.parent === level1).map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </VStack>
          )}
          {level2 !== '0' && (
            <VStack mt={2}>
              <ChevronDownIcon />
              <NativeSelectRoot>
                <NativeSelectField
                  value={level3}
                  onChange={(e) => onChangeLevel(3, e.target.value)}
                >
                  <option value={'0'}>全て</option>
                  {result.clusters.filter(c => c.parent === level2).map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </VStack>
          )}
          {level3 !== '0' && (
            <VStack mt={2}>
              <ChevronDownIcon />
              <NativeSelectRoot>
                <NativeSelectField
                  value={level4}
                  onChange={(e) => onChangeLevel(4, e.target.value)}
                >
                  <option value={'0'}>全て</option>
                  {result.clusters.filter(c => c.parent === level3).map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </VStack>
          )}
          <Presence present={open} w={'full'} mt={10}>
            <Heading size={'md'} mb={2}>詳細設定</Heading>
            <Box mb={4}>
              <Slider
                label={`上位何％のクラスタを表示するか: ${maxDensity * 100}%`}
                step={0.1}
                min={0.1}
                max={1}
                value={[maxDensity]}
                onValueChange={(e) => setMaxDensity(Number(e.value[0]))}
                marks={[
                  { value: 0.1, label: '10%' },
                  { value: 1, label: '100%' },
                ]}
              />
            </Box>
            <Box>
              <Slider
                label={`クラスタのサンプル数の最小数: ${minValue}`}
                step={1}
                min={0}
                max={10}
                value={[minValue]}
                onValueChange={(e) => setMinValue(Number(e.value[0]))}
                marks={[
                  { value: 0, label: '0' },
                  { value: 10, label: '10' },
                ]}
              />
            </Box>
          </Presence>
        </DialogBody>
        <DialogFooter justifyContent={'space-between'}>
          <Box>
            <Button onClick={onToggle} variant={'subtle'}>
              詳細設定
            </Button>
          </Box>
          <Box>
            <Button variant={'outline'} onClick={onReset} mr={2}>リセット</Button>
            <Button onClick={onApply}>設定を適用</Button>
          </Box>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
