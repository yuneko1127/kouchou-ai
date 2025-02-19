import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {Meta} from '@/type'
import {About} from '@/components/About'
import {Box, Card, Heading, HStack, Text} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon} from 'lucide-react'

export default async function Page() {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const reportsResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/reports')
  if (!metaResponse.ok || !reportsResponse.ok) {
    return <p>エラー：サーバーサイドレンダリングに失敗しました</p>
  }
  const meta: Meta = await metaResponse.json()
  const reports: { slug: string, status: string, title: string }[] = await reportsResponse.json()
  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <About meta={meta} />
        <Box mx={'auto'} maxW={'750px'} mb={5}>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
          {reports.map(report => (
            <Link
              key={report.slug}
              href={report.status === 'ready' ? `/${report.slug}` : '/'}
            >
              <Card.Root
                size="md"
                key={report.slug}
                mb={4}
                borderLeftWidth={10}
                borderLeftColor={report.status === 'ready' ? 'green' : 'gray'}
                cursor={report.status === 'ready' ? 'pointer' : 'progress'}
                className={report.status === 'ready' ? 'shadow' : ''}
              >
                <Card.Body>
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
                        /{report.slug}
                      </Card.Description>
                    </Box>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </Link>
          ))}
        </Box>
      </div>
      <Footer meta={meta} />
    </>
  )
}
