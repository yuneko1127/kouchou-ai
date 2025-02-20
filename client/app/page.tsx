import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {Meta, Report} from '@/type'
import {About} from '@/components/About'
import {Box, Card, Heading, HStack, Text} from '@chakra-ui/react'
import Link from 'next/link'
import {Metadata} from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const meta: Meta = await metaResponse.json()
  return {
    title: `${meta.reporter} - デジタル民主主義2030 ブロードリスニング`,
    description: `${meta.message}`,
    openGraph: {
      images: [process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/ogp.png'],
    },
  }
}

export default async function Page() {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const reportsResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/reports')
  if (!metaResponse.ok || !reportsResponse.ok) {
    return <></>
  }
  const meta: Meta = await metaResponse.json()
  const reports: Report[] = await reportsResponse.json()
  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <Box mx={'auto'} maxW={'900px'} mb={10}>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
          {reports.map(report => (
            <Link
              key={report.slug}
              href={`/${report.slug}`}
            >
              <Card.Root
                size="md"
                key={report.slug}
                mb={4}
                borderLeftWidth={10}
                borderLeftColor={meta.brandColor || '#2577b1'}
                cursor={'pointer'}
                className={'shadow'}
              >
                <Card.Body>
                  <HStack>
                    <Box>
                      <Card.Title>
                        <Text
                          fontSize={'lg'}
                          color={'#2577b1'}
                          mb={1}
                        >{report.title}</Text>
                      </Card.Title>
                      <Card.Description>
                        {report.description || ''}
                      </Card.Description>
                    </Box>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </Link>
          ))}
        </Box>
        <About meta={meta} />
      </div>
      <Footer meta={meta} />
    </>
  )
}
