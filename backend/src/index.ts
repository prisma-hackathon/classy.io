import { ApolloServer, gql } from 'apollo-server'
import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import crypto from 'crypto'
import path from 'path'

import { Photon } from '@generated/photon'
import { callWorker } from './worker/callWorker'

dotenv.config({
  path: path.join(__dirname, '../.envrc'),
})

function getRandomString(): string {
  return crypto.randomBytes(20).toString('hex')
}

function extractObjectUrl(url: string): string {
  const parsed = new URL(url)
  parsed.search = ''
  return parsed.toString()
}

const s3 = new AWS.S3({
  region: 'eu-central-1',
  // endpoint: 'classy-hackathon.s3-accelerate.amazonaws.com', // TODO: Unhardcode this
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const photon = new Photon()

const typeDefs = gql`
  type ClassificationJob {
    id: Int
    zipUrl: String
    zipUploaded: Boolean
    results: [ClassificationResult]
  }

  type Algorithm {
    id: Int
    name: String
    link: String
  }

  type ClassificationResult {
    id: Int
    algorithm: Algorithm
    accuracy: Float
    inferenceTime: Float
    trainingTime: Float
  }

  type Query {
    health: String
    getClassificationJob(id: Int): ClassificationJob
  }
  type UploadResponse {
    id: Int
    signedUrl: String
  }
  type Mutation {
    upload: UploadResponse
    uploadDone(id: Int): Boolean
  }
`

const resolvers = {
  Query: {
    health: () => '200 OK',
    getClassificationJob: (id: number) => {
      console.log(id)
      const job = photon.classificationJobs.findOne({
        where: {
          id: 1, // TODO: Unhardcode this
        },
        include: {
          results: true,
        },
      })
      return job
    },
  },
  Mutation: {
    upload: async () => {
      const filename = `${getRandomString()}.zip`
      const signedUrl = await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.S3_BUCKET,
        Key: filename,
      })
      const zipUrl = extractObjectUrl(signedUrl)

      const job = await photon.classificationJobs.create({
        data: {
          zipUrl,
          zipUploaded: false,
        },
      })
      return {
        id: job.id,
        signedUrl,
      }
    },
    uploadDone: async (id: number) => {
      try {
        const job = await photon.classificationJobs.update({
          where: {
            id,
          },
          data: {
            zipUploaded: true,
          },
        })
        callWorker(job.id)
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
