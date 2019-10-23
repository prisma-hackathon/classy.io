export async function request(query: string, variables: any): Promise<any> {
  const url = 'http://localhost:4000' // TODO: Unhardcode this
  const body = JSON.stringify({
    query,
    variables,
  })
  return fetch(url, {
    method: 'POST',
    body,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(res => {
      if (res.errors) {
        throw new Error(JSON.stringify(res.errors))
      }
      return res.data
    })
}
