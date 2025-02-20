import Papa from 'papaparse'

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
        const requiredFields = ['id', 'body']
        const fields = results.meta.fields || []
        const missingFields = requiredFields.filter(field => !fields.includes(field))
        if (missingFields.length > 0) {
          return reject(new Error(`必須カラムが存在しません: ${missingFields.join(', ')}`))
        }
        const data = results.data as Array<{ id: string; body: string }>
        const comments: Comment[] = data.map(row => ({
          id: row['id'],
          body: row['body']
        }))
        resolve(comments)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}
