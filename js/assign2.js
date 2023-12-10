document.addEventListener('DOMContentLoaded', () => {
    const apiURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';
    const localData = localStorage.getItem('songsData');

    if (localData) {
        const songs = JSON.parse(localData);
        displaySongs(songs);
        populateDropdowns(songs);
    } else {
        fetchSongsData(apiURL);
    }

    document.getElementById('playlistButton').addEventListener('click', function() {
        document.getElementById('searchView').style.display = 'none';  // Hide the Search View
        document.getElementById('playlistView').style.display = 'block'; // Show the Playlist View
        updatePlaylistView();
        displayPlaylist();
    });

    // Add an event listener for the "Credits" button
document.getElementById('creditsButton').addEventListener('mouseover', function() {
    if (!this.querySelector('.popUpPanel')) {
    const popUpPanel = document.createElement('div');
    popUpPanel.classList.add('popUpPanel'); // Add a class for the panel
    // Add content to pop-up
    popUpPanel.innerHTML = `
        <p>Joseph Kim</p>
        <p>Link to GitHub: <a href='https://github.com/jkim0521/COMP3512-Assignment2-Single-Page-Application' target='_blank'>Project Repository</a></p>
    `;
    // Append pop-up to the button
    this.appendChild(popUpPanel);

    // Show the pop-up
    popUpPanel.style.display = 'block';

    // Set timeout to hide pop-up after 5 seconds
    setTimeout(() => {
        if (popUpPanel) {
            popUpPanel.style.display = 'none';
            this.removeChild(popUpPanel);
        }
    }, 5000);
}
});

    // Attach event listener to the "Clear Playlist" button
    document.getElementById('clearPlaylist').addEventListener('click', function() {
        localStorage.setItem('playlist', JSON.stringify([])); // Clear the playlist in localStorage
        updateSearchViewButtons(); // Refresh the Add buttons
        updatePlaylistView(); // Clear the playlist display
    });

    // Attach event listeners to radio buttons for changing the filter input state
    document.querySelectorAll('input[name="searchType"]').forEach(radio => {
        radio.addEventListener('change', toggleFilterInputs);
    });

    // Attach event listeners to filter and clear buttons
    document.querySelector('#applyFilter').addEventListener('click', applyFilter);
    document.querySelector('#clearFilter').addEventListener('click', clearFilter);

    // Initialize the input states
    toggleFilterInputs();

    // Attach event listeners for sorting icons
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const criteria = this.dataset.sort;
            sortSongs(criteria);
        });
    });

    // Event listener for Close View button
    document.querySelector('#closeViewButton').addEventListener('click', () => {
        document.getElementById('singleSongView').style.display = 'none';
        document.getElementById('searchView').style.display = 'block';
        document.getElementById('playlistView').style.display = 'none';
         // Update button visibility
        document.getElementById('playlistButton').style.display = 'block';
        document.getElementById('closeViewButton').style.display = 'none';
    });
});

function fetchSongsData(apiURL) {
   fetch(apiURL)
       .then(response => response.json())
       .then(data => {
           localStorage.setItem('songsData', JSON.stringify(data));
           displaySongs(data);
           populateDropdowns(data);
       })
       .catch(error => console.error('Error fetching data:', error));
}

function displaySongs(songs) {
    const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    const tableBody = document.querySelector('#songsTable tbody');
    tableBody.innerHTML = '';

    songs.forEach(song => {
        const row = tableBody.insertRow();
        const titleCell = row.insertCell();
        const artistCell = row.insertCell();
        const yearCell = row.insertCell();
        const genreCell = row.insertCell();
        const popularityCell = row.insertCell();
        const addCell = row.insertCell();

        const titleLink = document.createElement('a');
        titleLink.href = '#';
        titleLink.textContent = song.title;
        titleLink.addEventListener('click', (function(currentSong) {
            return function(event) {
                event.preventDefault();
                showSingleSongView(currentSong);
            };
        })(song));
        titleCell.appendChild(titleLink);

        artistCell.textContent = song.artist.name;
        yearCell.textContent = song.year;
        genreCell.textContent = song.genre.name;
        popularityCell.textContent = song.details.popularity;

        const addButton = document.createElement('button');
        addButton.textContent = 'Add';

            // Style the button
                addButton.style.padding = '8px 16px';
                addButton.style.border = 'none';
                addButton.style.borderRadius = '4px';
                addButton.style.backgroundColor = 'cyan';
                addButton.style.color = '#333';
                addButton.style.cursor = 'pointer';
                addButton.style.transition = 'background-color 0.3s';   

        // Ensure song.song_id exists and is correctly referenced
        if (song.song_id !== undefined) {
            addButton.dataset.songId = song.song_id;
        } else {
        }
        addButton.addEventListener('click', function() {
            addToPlaylist(song.song_id); // Adjusted to pass song ID
            this.style.display = 'none'; // Hide the button immediately after adding to the playlist
            showSnackbar(`${song.title} added to playlist`);
        });

        // Check if the song is in the playlist and set button visibility
        if (playlist.includes(song.song_id)) {
            addButton.style.display = 'none';
        } else {
            addButton.style.display = 'block';
        }

        addCell.appendChild(addButton);
    });
}
 
 function showSingleSongView(song){
    console.log('Showing details for song:', song);
    // Retrieve song details from local storage
    const storedSongs = JSON.parse(localStorage.getItem('songsData'));

    // Populate Single Song View elements with song details
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('artistName').textContent = song.artist.name;
    document.getElementById('songGenre').textContent = song.genre.name;
    document.getElementById('songYear').textContent = song.year;
    document.getElementById('songDuration').textContent = formatDuration(song.details.duration);
    document.getElementById('songBPM').textContent = song.details.bpm;
    document.getElementById('songEnergy').textContent = song.analytics.energy;
    document.getElementById('songDanceability').textContent = song.analytics.danceability;
    document.getElementById('songLiveness').textContent = song.analytics.liveness;
    document.getElementById('songValence').textContent = song.analytics.valence;
    document.getElementById('songAcousticness').textContent = song.analytics.acousticness;
    document.getElementById('songSpeechiness').textContent = song.analytics.speechiness;
    document.getElementById('songPopularity').textContent = song.details.popularity;

    // Display the Single Song View and hide the main view
    console.log('Changing display to show Single Song View');
    document.getElementById('singleSongView').style.display = 'block';
    document.getElementById('searchView').style.display = 'none'
    document.getElementById('playlistView').style.display = 'none'

        // Apply Flexbox styles to the single song view
        const singleSongView = document.getElementById('singleSongView');
        singleSongView.style.display = 'flex';
        singleSongView.style.flexDirection = 'row';
        singleSongView.style.justifyContent = 'space-between';
        singleSongView.style.alignItems = 'flex-start';
        singleSongView.style.gap = '240px';
        singleSongView.style.padding = '80px';
        singleSongView.style.margin = '0 auto';
        singleSongView.style.maxWidth = '1200px';

        // Apply styles to song details and radar chart container
        const songDetails = document.getElementById('songDetails');
        songDetails.style.flex = '1';
        songDetails.style.padding = '40px'; // Add padding for spacing
        songDetails.style.backgroundColor = '#f0f0f0'; // Set a background color for contrast
        songDetails.style.borderRadius = '10px'; // Add rounded corners for aesthetics
        songDetails.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)'; // Add a subtle shadow
        songDetails.style.color = 'black'; // Set the text color to black for readability
        songDetails.style.width = '400px';
        songDetails.style.lineHeight = '1.4';

        const radarChartContainer = document.getElementById('radarChartContainer');
        songDetails.style.flex = '1';
        radarChartContainer.style.flex = '1';

    // Initialize the radar chart here with song analysis data
    // Extract the analysis data from the song object
    const analysisData = song.details; // Replace 'details' with the actual property that contains analysis data

    // Data for radar chart
    const data = {
        labels: [
            'Danceability',
            'Energy',
            'Valence',
            'Liveness',
            'Acousticness',
            'Speechiness',
            'Popularity',
            'BPM'
        ],
        datasets: [{
            label: song.title,
            data: [
                song.analytics.danceability,
                song.analytics.energy,
                song.analytics.valence,
                song.analytics.liveness,
                song.analytics.acousticness,
                song.analytics.speechiness,
                song.details.popularity,
                song.details.bpm
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }]
    };

    // Options for radar chart
    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'white',
                    lineWidth: 1, 
                },
                suggestedMin: 0,
                suggestedMax: 100,
                pointLabels: {
                    font: {
                        size: 18, // Adjust the size as needed
                        color: 'white' // Set font color to white
                    },
                    backdropColor: 'rgba(0, 0, 0, 0)', // Make the backdrop transparent
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        backgroundColor: 'white'
    };

    // Get the context of the canvas element we want to select
    const ctx = document.getElementById('radarChart').getContext('2d');

    // If there is an existing chart instance, destroy it to avoid memory leaks
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }

    // Create a new Chart instance
    window.radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: options
    }); 

    // Update button visibility
    document.getElementById('playlistButton').style.display = 'none';
    document.getElementById('closeViewButton').style.display = 'block';
 }

 function formatDuration(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function addToPlaylist(songId) {
    let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    console.log("Current playlist before adding:", playlist);

    if (!playlist.includes(songId)) {
        playlist.push(songId);
        console.log("Song ID being added:", songId);
        localStorage.setItem('playlist', JSON.stringify(playlist));
        console.log("Updated playlist:", playlist);
    }

    updatePlaylistView(); // Refresh the playlist view
    updateSearchViewButtons(); // Refresh the search view buttons
}

function updatePlaylistView() {
    // Retrieve the playlist array and songs data from localStorage
    let playlist = JSON.parse(localStorage.getItem('playlist')); // Adjust the key if needed
    let songs = JSON.parse(localStorage.getItem('songsData')); // Adjust the key if needed

    // Get the playlist table body element
    let playlistElement = document.getElementById('playlistTableBody'); // Adjust the ID if needed
    playlistElement.innerHTML = ''; // Clear existing content
    console.log("All Songs Data:", songs);
    // Filter the songs based on the playlist IDs and populate the table
    let playlistSongs = songs.filter(song => playlist.includes(song.song_id));
    console.log("Filtered Songs for Playlist:", playlistSongs);

    playlistSongs.forEach(song => {
        console.log("Processing song:", song);
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${song.title}</td>
            <td>${song.artist.name}</td>
            <td>${song.year}</td>
            <td>${song.genre.name}</td>
            <td>${song.details.popularity}</td>
            <td><button onclick="removeFromPlaylist(${song.song_id})">Remove</button></td>
        `;
        playlistElement.appendChild(row);
    });

    // Handle the case when the playlist is empty
    if (playlistSongs.length === 0) {
        console.log("Playlist is empty");
        playlistElement.innerHTML = '<tr><td colspan="6">No songs in playlist</td></tr>';
    }
}

function updateSearchViewButtons() {
    const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    const buttons = document.querySelectorAll('#songsTable button');

    buttons.forEach(button => {
        const songId = parseInt(button.dataset.songId);
        if (playlist.includes(songId)) {
            button.style.display = 'none';
        } else {
            button.style.display = 'inline-block';
        }
    });
}

function removeFromPlaylist(songId) {
    let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    playlist = playlist.filter(id => id !== songId);
    localStorage.setItem('playlist', JSON.stringify(playlist));
    displayPlaylist(); // Update the playlist view
    updateSearchViewButtons(); // Update the search view buttons
}

function displayPlaylist() {
    console.log("Displaying playlist...");
    const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    console.log("Playlist IDs:", playlist);
    const allSongs = JSON.parse(localStorage.getItem('songsData')) || [];
    const playlistTableBody = document.querySelector('#playlistTable tbody');
    playlistTableBody.innerHTML = ''; // Clear current playlist entries

    playlist.forEach(songId => {
        const row = playlistTableBody.insertRow();
        console.log("Processing song ID:", songId);
        const song = allSongs.find(s => s.song_id === songId);
        console.log("Found song details:", song);
        if (song) {
            const titleCell = row.insertCell();
            const titleLink = document.createElement('a');
            titleLink.textContent = song.title;
            titleLink.href = "#"; // Prevent the link from navigating away
            titleLink.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent the default anchor action
                showSingleSongView(song); // Pass the song object, not just the ID
            });
            titleCell.appendChild(titleLink);
            
            row.insertCell().textContent = song.artist.name;
            row.insertCell().textContent = song.year;
            row.insertCell().textContent = song.genre.name;
            row.insertCell().textContent = song.details.popularity;

            const removeCell = row.insertCell();
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                removeFromPlaylist(songId);
                displayPlaylist(); // Refresh the playlist view
            });
            removeCell.appendChild(removeButton);
        } else {
            console.log("Song with ID not found in allSongs data:", songId);
        }
    });
    // Update button visibility
    document.getElementById('playlistButton').style.display = 'none';
    document.getElementById('closeViewButton').style.display = 'block';

    // Display the Single Song View and hide the main view
    document.getElementById('singleSongView').style.display = 'none';
    document.getElementById('searchView').style.display = 'none'
    document.getElementById('playlistView').style.display = 'block'
}

//Function that implements sorting when table headers are clicked
const sortDirections = {
    title: 'asc',
    artist: 'asc',
    year: 'asc',
    genre: 'asc',
    popularity: 'asc'
};

document.querySelector('#sortTitle').addEventListener('click', () => sortSongs('title'));
document.querySelector('#sortArtist').addEventListener('click', () => sortSongs('artist'));
document.querySelector('#sortYear').addEventListener('click', () => sortSongs('year'));
document.querySelector('#sortGenre').addEventListener('click', () => sortSongs('genre'));
document.querySelector('#sortPopularity').addEventListener('click', () => sortSongs('popularity'));

// Function to sort the songs based on the criteria
function sortSongs(criteria) {
    const songs = JSON.parse(localStorage.getItem('songsData'));
    // Toggle between 'asc' and 'desc'
    sortState[criteria] = sortState[criteria] === 'asc' ? 'desc' : 'asc';
    const sortOrder = sortState[criteria];

    songs.sort((a, b) => {
        let aValue = a[criteria];
        let bValue = b[criteria];
        // Adjust for nested properties if necessary
        if (criteria === 'artist' || criteria === 'genre') {
            aValue = a[criteria].name;
            bValue = b[criteria].name;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });

    // Re-display songs with the new order
    displaySongs(songs);
}

// Define the sort state for each column
let sortState = {
    title: 'none', // can be 'none', 'asc', or 'desc'
    artist: 'none',
    year: 'none',
    genre: 'none',
    popularity: 'none'
};

//Function to search and filter songs
function applyFilter() {
   const filterType = document.querySelector('input[name="searchType"]:checked').value;
   let filterValue;

   if (filterType === 'title') {
       filterValue = document.querySelector('#titleInput').value.toLowerCase();
   } else if (filterType === 'artist') {
       filterValue = document.querySelector('#artistInput').value.toLowerCase();
   } else if (filterType === 'genre') {
       filterValue = document.querySelector('#genreInput').value.toLowerCase();
   }

   const songs = JSON.parse(localStorage.getItem('songsData'));
   let filteredSongs = songs.filter(song => {
       if (filterType === 'title') {
           return song.title.toLowerCase().includes(filterValue);
       } else if (filterType === 'artist') {
           return song.artist.name.toLowerCase() === filterValue;
       } else if (filterType === 'genre') {
           return song.genre.name.toLowerCase() === filterValue;
       }
   });

   if (filteredSongs.length === 0) {
       showSnackbar('No results found for your search.');
   } else {
       displaySongs(filteredSongs);
   }
}

function clearFilter() {
   // Clear the text field and reset dropdowns
   document.querySelector('#titleInput').value = '';
   document.querySelector('#artistInput').selectedIndex = 0;
   document.querySelector('#genreInput').selectedIndex = 0;

   // Reset to default radio (title)
   document.querySelector('#titleSearch').checked = true;

   // Update the input states
   toggleFilterInputs();

   // Display all songs again
   const songs = JSON.parse(localStorage.getItem('songsData'));
   displaySongs(songs);
}

document.querySelector('#clearFilter').addEventListener('click', clearFilter);

document.querySelector('#clearFilter').addEventListener('click', clearFilter);

//Function to populate filter dropdown menus
function populateDropdowns(songs) {
   const artistSelect = document.querySelector('#artistInput');
   const genreSelect = document.querySelector('#genreInput');

   let artists = new Set();
   let genres = new Set();

   songs.forEach(song => {
       artists.add(song.artist.name);
       genres.add(song.genre.name);
   });

   artistSelect.innerHTML = ''; // Clear existing options
   genreSelect.innerHTML = ''; // Clear existing options

   artists.forEach(artist => artistSelect.add(new Option(artist, artist)));
   genres.forEach(genre => genreSelect.add(new Option(genre, genre)));
}

//Function to disable other filter options
function toggleFilterInputs() {
   const titleInput = document.querySelector('#titleInput');
   const artistSelect = document.querySelector('#artistInput');
   const genreSelect = document.querySelector('#genreInput');

   // Determine which radio button is checked
   const filterType = document.querySelector('input[name="searchType"]:checked').value;

   // Enable the corresponding input and disable others
   titleInput.disabled = (filterType !== 'title');
   artistSelect.disabled = (filterType !== 'artist');
   genreSelect.disabled = (filterType !== 'genre');
}

// Add event listeners to radio buttons for change event
document.querySelectorAll('input[name="searchType"]').forEach(radio => {
   radio.addEventListener('change', toggleFilterInputs);
});

// Initialize the input states correctly when the page loads
document.addEventListener('DOMContentLoaded', () => {
   toggleFilterInputs();
});

// Initialize the state when the page loads
toggleFilterInputs();

// Add event listeners to radio buttons
document.querySelectorAll('input[name="searchType"]').forEach(radio => {
   radio.addEventListener('change', toggleFilterInputs);
});

// Add event listeners to radio buttons
document.querySelector('#titleSearch').addEventListener('change', toggleFilterInputs);
document.querySelector('#artistSearch').addEventListener('change', toggleFilterInputs);
document.querySelector('#genreSearch').addEventListener('change', toggleFilterInputs);

// Call this function on page load to set the initial state
toggleFilterInputs();

//Header visibility
let lastScrollTop = 0;

window.addEventListener("scroll", function() {
   var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
   if (currentScroll > lastScrollTop){
       // Scroll Down
       document.querySelector('header').style.top = '-60px'; // hides the header
   } else {
       // Scroll Up
       document.querySelector('header').style.top = '0px'; // shows the header
   }
   lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
}, false);

function showSnackbar(message) {
   // Create a div element for the snackbar
   const snackbar = document.createElement('div');
   
   // Set the message
   snackbar.textContent = message;
   
   // Add styling to position and style the snackbar
   snackbar.style.position = 'fixed';
   snackbar.style.bottom = '20px';
   snackbar.style.left = '50%';
   snackbar.style.transform = 'translateX(-50%)';
   snackbar.style.backgroundColor = 'black';
   snackbar.style.color = 'white';
   snackbar.style.padding = '10px';
   snackbar.style.borderRadius = '5px';
   snackbar.style.zIndex = '1000';
   snackbar.style.textAlign = 'center';
   snackbar.style.fontSize = '1rem';

   // Append the snackbar to the body
   document.body.appendChild(snackbar);

   // Use setTimeout to hide the snackbar after 3 seconds (3000 milliseconds)
   setTimeout(() => {
       snackbar.style.opacity = '0';
       // Use a transition for the opacity change
       snackbar.style.transition = 'opacity 0.5s ease';
       // Remove the snackbar after the transition
       setTimeout(() => document.body.removeChild(snackbar), 500);
   }, 3000);
}