export async function GET() {
  const data = [
    {
      slug: 'example',
      status: 'ready',
      title: '[テスト]人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？',
      description: 'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。'
    },
    {
      slug: 'processing',
      status: 'processing',
      title: '[テスト]出力中のレポート'
    },
  ]
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
