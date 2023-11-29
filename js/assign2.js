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

   // Attach event listeners to radio buttons for changing the filter input state
   document.querySelectorAll('input[name="searchType"]').forEach(radio => {
       radio.addEventListener('change', toggleFilterInputs);
   });

   // Attach event listeners to filter and clear buttons
   document.querySelector('#applyFilter').addEventListener('click', applyFilter);
   document.querySelector('#clearFilter').addEventListener('click', clearFilter);

   // Initialize the input states
   toggleFilterInputs();

   document.querySelectorAll('.sort-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const criteria = this.dataset.sort;
        sortSongs(criteria);
        });
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

fetchSongsData(apiURL).then(() => {
   const songs = JSON.parse(localStorage.getItem('songsData'));
   console.log(songs[0]); // Inspect the structure of the first song
});

//Function to populate songs table
function displaySongs(songs) {
   const tableBody = document.querySelector('#songsTable tbody');
   tableBody.innerHTML = ''; // Clear existing table entries

   songs.forEach(song => {
       const row = tableBody.insertRow(); // Insert a new row in the table

       // Insert cells for the song properties
       const titleCell = row.insertCell();
       const artistCell = row.insertCell();
       const yearCell = row.insertCell();
       const genreCell = row.insertCell();
       const popularityCell = row.insertCell();
       const addCell = row.insertCell();

       // Make the title clickable
       const titleLink = document.createElement('a');
       titleLink.href = '#'; // Placeholder, will be handled by JS
       titleLink.textContent = song.title;
       titleLink.addEventListener('click', (event) => {
           event.preventDefault();
           // TODO: Implement transition to Single Song view
       });
       titleCell.appendChild(titleLink);

       // Fill in the other cells with text
       artistCell.textContent = song.artist.name; // Updated
       yearCell.textContent = song.year;
       genreCell.textContent = song.genre.name; // Updated
       popularityCell.textContent = song.details.popularity; // Updated to access nested structure

       // Add button that allows the user to add the song to the playlist
       const addButton = document.createElement('button');
       addButton.textContent = 'Add';
       addButton.addEventListener('click', () => {
           addToPlaylist(song);
           showSnackbar(`${song.title} added to playlist`);
       });
       addCell.appendChild(addButton);
   });
}


//Function that implements sorting when table headers are clicked
const sortDirections = {
   title: 'ascending',
   artist: 'ascending',
   year: 'ascending',
   genre: 'ascending',
   popularity: 'ascending'
};

document.querySelector('#sortTitle').addEventListener('click', () => sortSongs('title'));
document.querySelector('#sortArtist').addEventListener('click', () => sortSongs('artist'));
document.querySelector('#sortYear').addEventListener('click', () => sortSongs('year'));
document.querySelector('#sortGenre').addEventListener('click', () => sortSongs('genre'));
document.querySelector('#sortPopularity').addEventListener('click', () => sortSongs('popularity'));

// Function to sort the songs based on the criteria
function sortSongs(criteria) {
    const songs = JSON.parse(localStorage.getItem('songsData'));
    const sortOrder = sortState[criteria] === 'asc' ? 'desc' : 'asc';
    
    songs.sort((a, b) => {
        let comparison = 0;
        let aValue = (criteria === 'artist' || criteria === 'genre') ? a[criteria].name : a[criteria];
        let bValue = (criteria === 'artist' || criteria === 'genre') ? b[criteria].name : b[criteria];

        // Check if we're comparing numbers or strings
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else {
            comparison = aValue.localeCompare(bValue);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Update the sort state
    sortState[criteria] = sortOrder;

    // Update the table with the sorted data
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

//Function to add a song to the playlist
function addToPlaylist(songId) {
   // Retrieve the existing playlist from local storage or initialize an empty array if none exists
   let playlist = JSON.parse(localStorage.getItem('playlist')) || [];

   // Retrieve all songs data
   const songs = JSON.parse(localStorage.getItem('songsData'));

   // Find the song object using songId
   const songToAdd = songs.find(song => song.id === songId);

   // Add song to the playlist if it's not already included
   if (songToAdd && !playlist.some(item => item.id === songId)) {
       playlist.push(songToAdd);

       // Save updated playlist to local storage
       localStorage.setItem('playlist', JSON.stringify(playlist));

       // Show snackbar/toast message
       showSnackbar(`${songToAdd.title} added to playlist`);
   }
}

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
