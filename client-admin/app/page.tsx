'use client'

import {Header} from '@/components/Header'
import {Report} from '@/type'
import {Box, Button, Card, Heading, HStack, Spinner, Text, VStack} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon, CircleAlertIcon, EllipsisIcon, ExternalLinkIcon} from 'lucide-react'
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from '@/components/ui/menu'
import {useEffect, useState} from 'react'

export default function Page() {
  const [reports, setReports] = useState<Report[]>()
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
        {!reports && (
          <VStack>
            <Spinner/>
          </VStack>
        )}
        {reports && reports.length === 0 && (
          <VStack my={10}>
            <Text>レポートがありません</Text>
          </VStack>
        )}
        {reports && reports.map(report => (
          <Card.Root
            size="md"
            key={report.slug}
            mb={4}
            borderLeftWidth={10}
            borderLeftColor={
              report.status === 'ready' ? 'green' :
                report.status === 'error' ? 'red.600' : 'gray'
            }
          >
            <Card.Body>
              <HStack justify={'space-between'}>
                <HStack>
                  <Box mr={3} color={
                    report.status === 'ready' ? 'green' :
                      report.status === 'error' ? 'red.600' : 'gray'
                  }>
                    {report.status === 'ready' ? (<CircleCheckIcon size={30}/>) :
                      report.status === 'error' ? (<CircleAlertIcon size={30}/>) :
                        (<CircleFadingArrowUpIcon size={30}/>)}
                  </Box>
                  <Box>
                    <Card.Title>
                      <Text
                        fontSize={'md'}
                        color={
                          report.status === 'ready' ? '#2577b1' :
                            report.status === 'error' ? 'red.600' : 'gray'
                        }
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
                      <MenuItem value={'duplicate'}>
                        レポートを複製して新規作成(開発中)
                      </MenuItem>
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
