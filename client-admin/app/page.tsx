import {Header} from '@/components/Header'
import {Meta, Report} from '@/type'
import {Box, Button, Card, Heading, HStack, Text} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon, EllipsisIcon, ExternalLinkIcon} from 'lucide-react'
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from '@/components/ui/menu'

export default async function Page() {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const reportsResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/admin/reports')
  if (!metaResponse.ok || !reportsResponse.ok) {
    return <></>
  }
  const meta: Meta = await metaResponse.json()
  const reports: Report[] = await reportsResponse.json()
  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <Box mx={'auto'} maxW={'1000px'} mb={5}>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Admin Dashboard</Heading>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
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
                      {report.status === 'ready' ? (<CircleCheckIcon size={30} />) : (<CircleFadingArrowUpIcon size={30} />)}
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
                          <ExternalLinkIcon />
                        </Button>
                      </Link>
                    )}
                    <MenuRoot>
                      <MenuTrigger asChild>
                        <Button variant="ghost" size="lg">
                          <EllipsisIcon />
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
    </>
  )
}
