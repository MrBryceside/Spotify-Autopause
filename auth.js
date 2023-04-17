function extractAccessToken(redirectUri) {
    const m = redirectUri.match(/[#?](.*)/)
    if (!m || m.length < 1)
        return null

    const params = new URLSearchParams(m[1].split('#')[0])
    return params.get('access_token')
}

function validate(redirectURL) {
    const accessToken = extractAccessToken(redirectURL)
    if (!accessToken)
        throw new Error('Authorization failure')

    return getProfile(accessToken)
}

/**
Authenticate and authorize using browser.identity.launchWebAuthFlow().
If successful, this resolves with a redirectURL string that contains
an access token.
*/
function authorize() {
    const redirectUrl = browser.identity.getRedirectURL()
    const clientId = '531204f31b944627bfa8474a34d6bfe4'
    const scopes = ['user-read-email', 'user-read-currently-playing', 'user-modify-playback-state']
    const state = generateRandomString(16)
    const authUrl = 'https://accounts.spotify.com/authorize'

    return browser.identity.launchWebAuthFlow({
        interactive: true,
        url: `${authUrl}?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scopes.join(' '))}&state=${encodeURIComponent(state)}`
    })
}

function getAccessToken() {
    return authorize().then(validate)
}