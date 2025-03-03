'use client'

import {Header} from '@/components/Header'
import {Report} from '@/type'
import {Box, Button, Card, Heading, HStack, Spinner, Text, VStack} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon, EllipsisIcon, ExternalLinkIcon} from 'lucide-react'
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from '@/components/ui/menu'
import {useEffect, useState} from 'react'

export default function Page() {
  const [reports, setReports] = useState<Report[]>([])
  useEffect(() => {
    (async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/admin/reports', {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
          'Content-Type': 'application/json'
        },
      })
      if (!response.ok) return
      setReports(await response.json())
    })()
  }, [])

  return (
    <div className={'container'}>
      <Header/>
      <Box mx={'auto'} maxW={'1000px'} mb={5}>
        <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Admin Dashboard</Heading>
        <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
        {reports.length === 0 && (
          <VStack>
            <Spinner />
          </VStack>
        )}
        {reports.map(report => (
          <Card.Root
            size="md"
            key={report.slug}
            mb={4}
            borderLeftWidth={10}
            borderLeftColor={report.status === 'ready' ? 'green' : 'gray'}
          >
            <Card.Body>
              <HStack justify={'space-between'}>
                <HStack>
                  <Box mr={3} color={report.status === 'ready' ? 'green' : 'gray'}>
                    {report.status === 'ready' ? (<CircleCheckIcon size={30}/>) : (
                      <CircleFadingArrowUpIcon size={30}/>)}
                  </Box>
                  <Box>
                    <Card.Title>
                      <Text
                        fontSize={'md'}
                        color={report.status === 'ready' ? '#2577b1' : 'gray'}
                      >{report.title}</Text>
                    </Card.Title>
                    <Card.Description>
                      {`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}
                    </Card.Description>
                  </Box>
                </HStack>
                <HStack>
                  {report.status === 'ready' && (
                    <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`} target={'_blank'}>
                      <Button variant={'ghost'}>
                        <ExternalLinkIcon/>
                      </Button>
                    </Link>
                  )}
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <Button variant="ghost" size="lg">
                        <EllipsisIcon/>
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem
                        value="delete"
                        color="fg.error"
                      >
                        レポートを削除する(開発中)
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>
                </HStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
        <HStack justify={'center'} mt={10}>
          <Link href={'/create'}>
            <Button size={'xl'}>新しいレポートを作成する</Button>
          </Link>
        </HStack>
      </Box>
    </div>
  )
}
