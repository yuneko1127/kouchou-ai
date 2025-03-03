import {Meta, Report, Result} from '@/type'
import {ClientContainer} from '@/components/report/ClientContainer'
import {Header} from '@/components/Header'
import {Overview} from '@/components/report/Overview'
import {Footer} from '@/components/Footer'
import {ClusterOverview} from '@/components/report/ClusterOverview'
import {About} from '@/components/About'
import {Separator} from '@chakra-ui/react'
import {Metadata} from 'next'
import {getApiBaseUrl} from '../utils/api'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

// ISR 5分おきにレポート更新確認
export const revalidate = 300

export async function generateStaticParams() {
  try {
    const response = await fetch(getApiBaseUrl() + '/reports', {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      },
    })
    const reports: Report[] = await response.json()
    return reports
      .filter((report) => report.status === 'ready')
      .map((report) => ({
        slug: report.slug,
      }))
  } catch(_e) {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const slug = (await params).slug
    const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
    const resultResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + `/reports/${slug}`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      },
    })
    if (!metaResponse.ok || !resultResponse.ok) {
      return {}
    }
    const meta: Meta = await metaResponse.json()
    const result: Result = await resultResponse.json()
    return {
      title: `${result.config.question} - ${meta.reporter}`,
      description: `${result.overview}`,
      openGraph: {
        images: [process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/ogp.png'],
      },
    }
  } catch (_e) {
    return {}
  }
}

export default async function Page({params}: PageProps) {
  try {
    const slug = (await params).slug
    const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
    const resultResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + `/reports/${slug}`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_PUBLIC_API_KEY || '',
        'Content-Type': 'application/json'
      },
    })
    const contentLength = resultResponse.headers.get('Content-Length')
    const resultSize = contentLength ? parseInt(contentLength, 10) : 0
    const meta: Meta = await metaResponse.json()
    const result: Result = await resultResponse.json()

    return (
      <>
        <div className={'container'}>
          <Header meta={meta} />
          <Overview result={result} />
          <ClientContainer resultSize={resultSize} reportName={slug}>
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
  } catch(_e) {
    return <p>エラー：データの取得に失敗しました<br />Error: fetch failed to {process.env.NEXT_PUBLIC_API_BASEPATH}.</p>
  }
}
