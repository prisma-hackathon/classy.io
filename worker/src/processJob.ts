let lastReqId

export const processJob = async (event, context) => {
  if (lastReqId == context.awsRequestId) {
    console.log(`Aborting`)
    return context.succeed() // abort
  } else {
    lastReqId = context.awsRequestId // keep request id for next invokation
  }

  setTimeout(() => {
    console.dir(event, { depth: null })
  }, 3000)
}
