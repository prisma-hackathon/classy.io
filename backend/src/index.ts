import { ApolloServer, gql } from 'apollo-server'
import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import crypto from 'crypto'

import { Photon } from '@generated/photon'
import { callWorker } from './worker/callWorker'

dotenv.config()

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
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const photon = new Photon()

const typeDefs = gql`
  type Query {
    health: String
  }
  type Mutation {
    upload: String
    uploadDone(id: Int): String
  }
`

const resolvers = {
  Query: {
    health: () => '200 OK',
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
          signedUrl,
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
