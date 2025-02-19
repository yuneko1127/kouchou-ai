import {Footer} from '@/components/Footer'
import {Meta} from '@/type'
import {Header} from '@/components/Header'
import {CreateForm} from '@/components/create/CreateForm'

export default async function Page() {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  if (!metaResponse.ok) {
    return <p>エラー：サーバーサイドレンダリングに失敗しました</p>
  }
  const meta: Meta = await metaResponse.json()
  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <CreateForm />
      </div>
      <Footer meta={meta} />
    </>
  )
}
