const audioEnjoyers = new Set([])
const playing = {
    is: false,
    autoPaused: false
}

async function init() {
    // Initialize current state
    playing.is = await isCurrentlyPlaying()

    const data = await browser.storage.local.get()
    console.log('data autoPaused?', data)
    playing.autoPaused = data.autoPaused ?? false

    scanTabs()
}

function handleUpdate(tabId, changeInfo, tab) {
    // Check if the tab is playing audio
    if (tab.audible && !audioEnjoyers.has(tabId)) {
        audioEnjoyers.add(tabId)
        console.log(`Tab ${tabId} is playing audio`)

        pauseIfPlaying()
    } else if (audioEnjoyers.has(tabId)) {
        audioEnjoyers.delete(tabId)

        unpauseIfInControl()
    }
}

async function scanTabs() {
    audioEnjoyers.clear()

    // Find audible tabs
    const tabs = await browser.tabs.query({ audible: true })
    for (const tab of tabs)
        audioEnjoyers.add(tab.id)

    // Attempt to pause
    if (audioEnjoyers.size)
        return pauseIfPlaying()
    
    return unpauseIfInControl()
}

async function pauseIfPlaying() {
    // Verify that there is an audible tab and Spotify is playing
    if (!audioEnjoyers.size || !playing.is)
        return

    // We are taking control of the playback state
    playing.autoPaused = playing.is

    try {
        // Update the current playback state
        playing.is = await changePlayback('pause')
    } catch(err) {
        console.error('Could not pause playback', err)
        playing.autoPaused = false
    }

    try {
        // Save autoPaused state
        await browser.storage.local.set({ autoPaused: playing.autoPaused })
    } catch(err) {
        console.error('Could not save autoPaused state', err)
    }
}

async function unpauseIfInControl() {
    // Verify that there are no more audible tabs and we are controlling the state
    if (audioEnjoyers.size !== 0 || !playing.autoPaused)
        return

    try {
        // Update the current playback state
        playing.is = await changePlayback('play')
    } catch(err) {
        console.error('Could not unpause playback', err)
    }

    if (!playing.is)
        return

    // We are no longer controlling the playback state
    playing.autoPaused = false

    try {
        await browser.storage.local.set({ autoPaused: playing.autoPaused })
    } catch(err) {
        console.error('Could not save autoPaused state', err)
    }
}