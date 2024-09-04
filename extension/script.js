// happens on load of the page
const id = window.location.pathname.split('/playlist/')[1];
console.log(id);
localStorage.setItem('playlistId', id);

// happens on click of the start button
document.getElementById('start').addEventListener('click', function() {
    const average = 0
    const median = 0
    const averageDuration = 0
    const token = ""
    let tokenTimer
    const decades = []
    
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
            token = data.access_token
            tokenTimer = new Date()

            fetchTracks()
        })
    }
    
    async function fetchTracks() {
        const playlist_id = localStorage.getItem('playlistId')
        let tracks = []
        let nextUrl = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`
        
        if (new Date() - tokenTimer > 600000) {
            await fetchToken()
        }
        
        while (nextUrl !== null) {
            await fetch(nextUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
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
        decades = []
        tracks = tracks.filter(item => item.album.release_date !== null)
        tracks.forEach(item => {
            let releaseYear = parseInt(item.album.release_date.split("-")[0])
            total += releaseYear
            
            releaseDates.push(releaseYear)
            
            averageDuration += item.duration_ms
            
            let decade = Math.floor(releaseYear / 10) * 10
            let index = decades.findIndex(x => x.decade === `${decade}s`)
            if (index === -1) {
                decades.push({ decade: `${decade}s`, songs: [item] })
            } else {
                decades[index].songs.push(item)
            }
        });
        decades.sort((a, b) => parseInt(b.decade) - parseInt(a.decade))
        releaseDates.sort((a, b) => a - b)
        
        average = Math.floor(total / tracks.length)
        median = releaseDates[Math.floor(releaseDates.length / 2)]
        averageDuration = Math.floor(averageDuration / tracks.length) / 1000
    }

    let averageP = document.createElement('p');
    p.textContent = `Average release year: ${average}`;
    document.getElementById('test').appendChild(averageP);
    let medianP = document.createElement('p');
    p.textContent = `Average release year: ${median}`;
    document.getElementById('test').appendChild(medianP);

    for (let i = 0; i < decades.length; i++) {
        let decade = decades[i];
        let decadeDiv = document.createElement('div');
        decadeDiv.classList.add('decade');
        let decadeP = document.createElement('p');
        decadeP.textContent = `${decade.decade} (${decade.songs.length})`;
        decadeDiv.appendChild(decadeP);
        let songsDiv = document.createElement('div');
        songsDiv.classList.add('songs');
        decade.songs.forEach(song => {
            let songP = document.createElement('p');
            songP.textContent = `${song.name} - ${song.artists[0].name}`;
            songsDiv.appendChild(songP);
        });
        decadeDiv.appendChild(songsDiv);
        document.getElementById('test').appendChild(decadeDiv);
    }

    let durationP = document.createElement('p');
    p.textContent = `Average duration: ${averageDuration}`;
    document.getElementById('test').appendChild(durationP);

    document.getElementById('start').style.display = 'none';
});