export async function fetchWrapper(baseurl,url,options) {
    const response = await fetch(`${baseurl}`+url,options)
    const json = await response.json()
    return response.ok ? json : Promise.reject(json)
}
