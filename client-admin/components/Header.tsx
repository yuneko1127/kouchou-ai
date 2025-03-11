import {Alert, Box, HStack, Image, Text} from '@chakra-ui/react'
import {XIcon} from 'lucide-react'


export function Header() {
  return (
    <HStack justify="space-between" alignItems={'center'} mb={8} mx={'auto'} maxW={'1200px'}>
      <HStack>
        <Image
          src={process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/reporter.png'}
          mx={'auto'}
          objectFit={'cover'}
          maxH={{base: '40px', md: '60px'}}
          maxW={{base: '120px', md: '200px'}}
          alt={'レポート発行者'}
        />
        <XIcon color={'gray'}/>
        <Box
          fontWeight={'bold'}
          className={'gradientColor'}
        >
          <Text
            fontSize={{base: 'md', md: 'lg'}}
          >広聴AI</Text>
          <Text
            fontSize={{base: 'xs', md: 'sm'}}
            lineHeight={1.1}
          >デジタル民主主義2030<br/>ブロードリスニング</Text>
        </Box>
      </HStack>
      <HStack>
        <Alert.Root status="warning">
          <Alert.Indicator/>
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
