import React, { useState, useEffect } from 'react'
import { GraphQLClient, ClientContext, useQuery } from 'graphql-hooks'

import { request } from './utils/request'

import './App.css'

const client = new GraphQLClient({
  url: 'http://localhost:4000', // TODO: Unhardcode this
})

interface Algorithm {
  id: number
  name: string
  link: string
}

interface ClassificationResult {
  id: number
  algorithm: Algorithm
  accuracy: number | string
  inferenceTime: number | string
  trainingTime: number | string
}

const App: React.FC = () => {
  const [file, setFile] = useState(null)

  const [ClassificationResults, setClassificationResults] = useState<
    ClassificationResult[]
  >([
    {
      id: 0,
      algorithm: {
        id: 0,
        name: 'FastText',
        link: 'https://github.com/loretoparisi/fasttext.js/',
      },
      accuracy: '-',
      inferenceTime: '-',
      trainingTime: '-',
    },
    {
      id: 0,
      algorithm: {
        id: 0,
        name: 'Bag of Words + TF-IDF',
        link: 'https://github.com/techfort/mimir',
      },
      accuracy: '-',
      inferenceTime: '-',
      trainingTime: '-',
    },
  ])

  const onUpload = (e: any) => {
    // TODO: Use correct event type React.FormEvent<HTMLInputElement>
    const file = e.target.files[0]
    setFile(file)
  }

  useEffect(() => {
    const fetchData = async () => {
      console.log(file)

      const SIGNED_URL_QUERY = /* GraphQL */ `
        mutation getSignedUrl {
          upload {
            id
            signedUrl
          }
        }
      `

      const data = await request(SIGNED_URL_QUERY, {})

      const { id, signedUrl } = data.upload // TODO: Error handling around this
      console.log(id, signedUrl)

      const r = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
      })
      if (r.ok) {
        console.log('All good')
      } else {
        console.error(`${r.status}: ${r.statusText}`)
      }
    }
    if (!Boolean(file)) {
      console.log('No file in the context')
      return
    }
    console.log('File in the context')
    fetchData()
  }, [file])

  return (
    <ClientContext.Provider value={client}>
      <div className="App">
        <header className="App-header">
          <div className="table">
            <div className="table-header">
              <div>Algorithm</div>
              <div>Accuracy</div>
              <div>Inference Time</div>
              <div>Training Time</div>
              <div>Link</div>
            </div>
            {ClassificationResults.map(classificationResult => {
              return (
                <div className="table-row">
                  <div>{classificationResult.algorithm.name}</div>
                  <div>{classificationResult.accuracy}</div>
                  <div>{classificationResult.inferenceTime}</div>
                  <div>{classificationResult.trainingTime}</div>
                  <div>
                    <a href={classificationResult.algorithm.link}>Link</a>
                  </div>
                </div>
              )
            })}
          </div>

          <br />

          <input
            type="file"
            id="upload-csv"
            name="upload-csv"
            onChange={onUpload}
          />
        </header>
      </div>
    </ClientContext.Provider>
  )
}

export default App
