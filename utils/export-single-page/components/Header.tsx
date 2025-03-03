import {Heading, HStack, Image} from '@chakra-ui/react'
import {XIcon} from 'lucide-react'
import {BroadlisteningGuide} from '@/components/report/BroadlisteningGuide'
import {Meta} from '@/type'
import {getApiBaseUrl} from '../../../client/app/utils/api'


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
        <Heading
          as={'h1'}
          size={{base: 'sm', md: 'lg'}}
          fontWeight={'bold'}
          className={'gradientColor'}
          lineHeight={'1.4'}
        >デジタル民主主義2030<br/>ブロードリスニング</Heading>
      </HStack>
      <BroadlisteningGuide/>
    </HStack>
  )
}
