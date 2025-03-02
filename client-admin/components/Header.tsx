import {Alert, Heading, HStack, Image} from '@chakra-ui/react'
import {XIcon} from 'lucide-react'
import {getApiBaseUrl} from '../app/utils/api'

export function Header() {
  return (
    <HStack justify="space-between" alignItems={'center'} mb={8} mx={'auto'} maxW={'1200px'}>
      <HStack>
        <Image
          src={getApiBaseUrl() + '/meta/reporter.png'}
          mx={'auto'}
          objectFit={'cover'}
          maxH={{base: '40px', md: '60px'}}
          maxW={{base: '120px', md: '200px'}}
          alt={'レポート発行者'}
        />
        <XIcon color={'gray'}/>
        <Heading
          as={'h1'}
          size={{base: 'sm', md: 'lg'}}
          fontWeight={'bold'}
          className={'gradientColor'}
          lineHeight={'1.4'}
        >デジタル民主主義2030<br/>ブロードリスニング</Heading>
      </HStack>
      <HStack>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title fontSize={'md'}>管理者画面</Alert.Title>
            <Alert.Description>
              このページはレポート作成者向けの管理画面です
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </HStack>
    </HStack>
  )
}
