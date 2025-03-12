import Papa from 'papaparse'
import {v4} from 'uuid'

type CsvData = Record<string, unknown>

export async function parseCsv(csvFile: File): Promise<CsvData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CsvData[]
        const converted = data.map(row => ({
          ...row,
          id: v4(),
        }))
        resolve(converted)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}
