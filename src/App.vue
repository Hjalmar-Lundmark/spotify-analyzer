<script setup>
import { onMounted, ref } from "vue"

const average = ref(0)
const median = ref(0)
const averageDuration = ref(0)
const token = ref("")
let tokenTimer
const decades = ref([])

onMounted(() => {
    fetchToken()
})

async function fetchToken() {
    const client_id = import.meta.env.VITE_CLIENT_ID
    const client_secret = import.meta.env.VITE_CLIENT_SECRET

    await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
    })
        .then(response => response.json())
        .then(data => {
            token.value = data.access_token
            tokenTimer = new Date()
        })
}

async function fetchTracks() {
    const url = document.getElementById("playlist").value
    const playlist_id = url.split("/")[4].split("?")[0]
    let tracks = []
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`

    if (new Date() - tokenTimer > 600000) {
        await fetchToken()
    }

    while (nextUrl !== null) {
        await fetch(nextUrl, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
            .then(response => response.json())
            .then(data => {
                data.items.forEach(element => {
                    tracks.push(element.track)
                });
                nextUrl = data.next
            })
    }

    let total = 0
    let releaseDates = []
    decades.value = []
    tracks = tracks.filter(item => item.album.release_date !== null)
    tracks.forEach(item => {
        let releaseYear = parseInt(item.album.release_date.split("-")[0])
        total += releaseYear

        releaseDates.push(releaseYear)

        averageDuration.value += item.duration_ms

        let decade = Math.floor(releaseYear / 10) * 10
        let index = decades.value.findIndex(x => x.decade === `${decade}s`)
        if (index === -1) {
            decades.value.push({ decade: `${decade}s`, songs: [item] })
        } else {
            decades.value[index].songs.push(item)
        }
    });
    decades.value.sort((a, b) => parseInt(b.decade) - parseInt(a.decade))
    releaseDates.sort((a, b) => a - b)

    average.value = Math.floor(total / tracks.length)
    median.value = releaseDates[Math.floor(releaseDates.length / 2)]
    averageDuration.value = Math.floor(averageDuration.value / tracks.length) / 1000
}


</script>

<template>
    <h1>Spotify Playlist Analyzer</h1>
    <p>Enter a Spotify playlist URL to analyze the release dates of the songs.</p>
    <input type="text" id="playlist" placeholder="Drop spotify playlist url here">
    <button v-on:click="fetchTracks">Send</button>
    <p>
        Average duration: {{ Math.floor(averageDuration / 60) }}min
        {{ Math.floor(averageDuration - (Math.floor(averageDuration / 60) * 60)) }}sec
    </p>
    <p>Average release date: {{ average }}<br>Median release date: {{ median }}</p>
    <p>Most common decades by song count:</p>
    <ul>
        <li v-for="decade in decades">{{ decade.decade }}: {{ decade.songs.length }}</li>
    </ul>
</template>

<style>
button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}

input {
    padding: 10px;
    font-size: 16px;
    width: 40vw;
}

p {
    font-size: 16px;
    margin-bottom: 0;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}
</style>
