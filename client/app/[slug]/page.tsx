import {Meta, Result} from '@/type'
import {ClientContainer} from '@/components/report/ClientContainer'
import {Header} from '@/components/Header'
import {Overview} from '@/components/report/Overview'
import {Footer} from '@/components/Footer'
import {ClusterOverview} from '@/components/report/ClusterOverview'
import {About} from '@/components/About'
import {Separator} from '@chakra-ui/react'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const reports: { slug: string, status: string, title: string }[] = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/reports').then((res) => res.json())
  return reports
    .filter((report) => report.status === 'ready')
    .map((report) => ({
      slug: report.slug,
    }))
}

export default async function Page({params}: PageProps) {
  const slug = (await params).slug
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const resultResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + `/reports/${slug}`)
  if (!resultResponse.ok || !metaResponse.ok) {
    return <p>エラー：サーバーサイドレンダリングに失敗しました</p>
  }
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
        <Separator my={12} w={'750px'} mx={'auto'}/>
        <About meta={meta} />
      </div>
      <Footer meta={meta} />
    </>
  )
}
