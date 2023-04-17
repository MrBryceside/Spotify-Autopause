async function getProfile(accessToken) {
    const url = 'https://api.spotify.com/v1/me'
    const request = new Request(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    const response = await fetch(request)
    if (response.status !== 200)
        throw new Error('Token validation error')

    const res = await response.json()
    if (!res.uri) 
        throw new Error('Token validation error')

    return Object.assign({ accessToken }, res)
}

async function isCurrentlyPlaying() {
	const spotifyData = await browser.storage.local.get()
	if (!spotifyData.accessToken)
		throw new Error('Not authenticated')

    const url = 'https://api.spotify.com/v1/me/player/currently-playing'
    const request = new Request(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${spotifyData.accessToken}` }
    })

    const response = await fetch(request)
    if (response.status !== 200 && response.status !== 204)
        return false

    const res = await response.json()

    return res.is_playing ?? false
}

async function changePlayback(action) {
	const spotifyData = await browser.storage.local.get()
	if (!spotifyData.accessToken)
		throw new Error('Not authenticated')

	if (action !== 'pause' && action !== 'play')
		throw new Error('Invalid playback action')

    const url = `https://api.spotify.com/v1/me/player/${action}`
    const request = new Request(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${spotifyData.accessToken}` }
    })

    const response = await fetch(request)
    if (response.status !== 204 && response.status !== 204)
        return false

    return true
}