import fs from 'fs'
import path from 'path'
import {Meta, Result} from '@/type'
import {ClientContainer} from '@/components/report/ClientContainer'
import {Header} from '@/components/Header'
import {Overview} from '@/components/report/Overview'
import {Footer} from '@/components/Footer'
import {ClusterOverview} from '@/components/report/ClusterOverview'
import {About} from '@/components/About'
import {Separator} from '@chakra-ui/react'
import {Metadata} from 'next'

import metaJson from '@/public/meta/metadata.json'
import resultJson from '@/public/hierarchical_result.json'

export async function generateMetadata(): Promise<Metadata> {
  const meta: Meta = metaJson
  const result: Result = resultJson as unknown as Result
  return {
    title: `${result.config.question} - ${meta.reporter}`,
    description: `${result.overview}`,
    openGraph: {
      images: ['./meta/ogp.png'],
    },
  }
}

export default async function Page() {
  const filePath = path.resolve(process.cwd(), 'public/hierarchical_result.json')
  const stats = fs.statSync(filePath)
  const resultSize = stats.size
  const meta: Meta = metaJson
  const result: Result = resultJson as unknown as Result

  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <Overview result={result} />
        <ClientContainer resultSize={resultSize}>
          {result.clusters.filter(c => c.level === 1).map(c => (
            <ClusterOverview key={c.id} cluster={c} />
          ))}
        </ClientContainer>
        <Separator my={12} maxW={'750px'} mx={'auto'}/>
        <About meta={meta} />
      </div>
      <Footer meta={meta} />
    </>
  )
}
