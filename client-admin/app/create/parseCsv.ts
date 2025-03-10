import Papa from 'papaparse'
import { v4 } from 'uuid'

type Comment = {
  id: string
  body: string
}

export async function parseCsv(csvFile: File): Promise<Comment[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields || []
        if (!fields.includes('comment')) {
          return reject(new Error('必須カラム "comment" が存在しません'))
        }
        const data = results.data as Array<{ comment: string }>
        const comments: Comment[] = data.map(row => ({
          id: v4(),
          body: row['comment']
        }))
        resolve(comments)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}
