import {Alert, Heading, HStack, Image} from '@chakra-ui/react'
import {XIcon} from 'lucide-react'
import {Meta} from '@/type'

type Props = {
  meta: Meta | null
}

export function Header({meta}: Props) {
  return (
    <HStack justify="space-between" alignItems={'center'} mb={8} mx={'auto'} maxW={'1200px'}>
      <HStack>
        {meta && (
          <>
            <Image
              src={process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/reporter.png'}
              mx={'auto'}
              objectFit={'cover'}
              maxH={{base: '40px', md: '60px'}}
              maxW={{base: '120px', md: '200px'}}
              alt={meta.reporter}
            />
            <XIcon color={'gray'}/>
          </>
        )}
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
