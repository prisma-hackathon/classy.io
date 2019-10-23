import * as AWS from 'aws-sdk'
const Lambda = new AWS.Lambda({
  region: 'eu-central-1',
})

async function invokeLambda(functionName: string, payload: any) {
  const req: AWS.Lambda.InvocationRequest = {
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
    InvocationType: 'Event',
    LogType: 'Tail',
  }
  await Lambda.invoke(req).promise()
}

async function callWorker(classificationJobId: number) {
  await invokeLambda('classy-worker-dev-classify', {
    classificationJobId,
  })
}

callWorker(100)
