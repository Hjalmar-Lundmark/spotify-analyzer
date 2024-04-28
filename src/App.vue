<script setup>
import { onMounted, ref } from 'vue'

const playlist = ref([])
const average = ref(0)
const token = ref('')

onMounted(() => {
  fetchToken()
})

function fetchToken() {
    const client_id = import.meta.env.VITE_CLIENT_ID
    const client_secret = import.meta.env.VITE_CLIENT_SECRET
    console.log(client_id, client_secret)

  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
  }).then(response => response.json())
    .then(data => {
      console.log(data)
        token.value = data.access_token
    })
}

async function fetchTracks() {
    const url = document.getElementById('playlist').value
    const playlist_id = url.split('/')[4]
    console.log(playlist_id)

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
    headers: {
        Authorization: `Bearer ${token.value}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
        playlist.value = data.items
    })


}


</script>

<template>
    <input type="text" id="playlist">
    <button v-on:click="fetchTracks">Send</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
