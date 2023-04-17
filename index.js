console.log('Loaded extension!')

// Attempt to get spotify access token
// Show the Spotify login view if one cannot be found
getAccessToken().then(async response => {
    await browser.storage.local.set(response)
    return init()
}).catch(error => {
    console.error(error)
    return destroy()
})

// Listen for tabs being updated
browser.tabs.onUpdated.addListener(handleUpdate)

// Something went wrong, hang up the listener
const destroy = () => browser.tabs.onUpdated.removeListener(handleUpdate)
