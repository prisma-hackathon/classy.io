const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    hello: String
  }
  type Mutation {
    upload: String
    uploadDone: String
  }
`

const resolvers = {
  Query: {
    health: () => '200 OK',
  },
  Mutation: {
    upload: () => {},
    uploadDone: () => {},
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
