// happens on load of the page
const id = window.location.pathname.split('/playlist/')[1];
console.log(id);
localStorage.setItem('playlistId', id);

// happens on click of the start button
document.getElementById('start').addEventListener('click', function() {
    document.getElementById('start').textContent = 'Loading...';
    let log = document.getElementById('log');

    let average = 0
    let median = 0
    let averageDuration = 0
    let token = ""
    let decades = []
    
    let client_id = import.meta.env.VITE_CLIENT_ID
    let client_secret = import.meta.env.VITE_CLIENT_SECRET

    log.innerHTML = log.innerHTML + 'Fetching token...<br>';
    
    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
    })
    .then(response => response.json())
    .then(data => {
        token = data.access_token
        log.innerHTML = log.innerHTML + 'Token fetched...<br>';
        fetchTracks()
    })
    .catch(error => {
        log.innerHTML = log.innerHTML + 'Error fetching token...<br>' + error + '<br>';
    });

    log.innerHTML = log.innerHTML + 'Between funcs...<br>';
    
    async function fetchTracks() {
        let playlist_id = localStorage.getItem('playlistId');
        let tracks = []
        let nextUrl = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`
        log.innerHTML = log.innerHTML + 'Playlist ID: ' + playlist_id + '<br>';

        log.innerHTML = log.innerHTML + 'Fetching tracks...<br>';

        while (nextUrl !== null) {
            await fetch(nextUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {log.innerHTML = log.innerHTML + JSON.stringify(response) + '<br>'; response.json()})
            .then(data => {
                data.items.forEach(element => {
                    tracks.push(element.track)
                });
                nextUrl = data.next
            })
            .catch(error => {
                log.innerHTML = log.innerHTML + 'Error fetching token...<br>' + error + '<br>';
            });
            crash()
        }

        log.innerHTML = log.innerHTML + 'Tracks fetched...<br>';
        
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

        log.innerHTML = log.innerHTML + 'Tracks processed...<br>';
        
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
    }
});