'use client'

import {Box, Button, Heading, Image, Text, VStack} from '@chakra-ui/react'
import {Meta} from '@/type'
import {ExternalLinkIcon} from 'lucide-react'
import Link from 'next/link'

type AboutProps = {
  meta: Meta
}

export function About({meta}: AboutProps) {
  return (
    <Box mx={'auto'} maxW={'750px'} mb={12}>
      <Heading textAlign={'center'} fontSize={'xl'} mb={5}>About</Heading>
      <Image
        src={process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/reporter.png'}
        mx={'auto'}
        mb={5}
        objectFit={'cover'}
        maxW={'250px'}
        alt={meta.reporterName}
      />
      <Text mb={5} whiteSpace={'pre-line'}>
        {meta.projectMessage}
      </Text>
      <VStack>
        {meta.projectLink && (
          <Link href={meta.projectLink} target={'_blank'} rel={'noopener noreferrer'}>
            <Button size={'2xl'} w={'300px'} className={'gradientBg shadow'}>ウェブサイトを見る<ExternalLinkIcon /></Button>
          </Link>
        )}
      </VStack>
    </Box>
  )
}
