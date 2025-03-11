import {Box, HStack, Image, Text} from '@chakra-ui/react'
import {XIcon} from 'lucide-react'
import {BroadlisteningGuide} from '@/components/report/BroadlisteningGuide'
import {Meta} from '@/type'
import {getApiBaseUrl} from '@/app/utils/api'

type Props = {
  meta: Meta | null
}

export function Header({meta}: Props) {
  return (
    <HStack justify="space-between" mb={8} mx={'auto'} maxW={'1200px'}>
      <HStack>
        {meta && (
          <>
            <Image
              src={getApiBaseUrl() + '/meta/reporter.png'}
              mx={'auto'}
              objectFit={'cover'}
              maxH={{base: '40px', md: '60px'}}
              maxW={{base: '120px', md: '200px'}}
              alt={meta.reporter}
            />
            <XIcon color={'gray'}/>
          </>
        )}
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
      <BroadlisteningGuide/>
    </HStack>
  )
}
