import data from './hierarchical_result.json'

export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Content-Length': Buffer.byteLength(JSON.stringify(data), 'utf8').toString()
    },
  })
}
