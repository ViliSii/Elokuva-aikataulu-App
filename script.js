document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchButton').addEventListener('click', searchMovies);

    // Tumma tai vaalea tila nappi
    const themeToggleButton = document.getElementById('themeToggleButton');
    const body = document.body;

    themeToggleButton.addEventListener('click', toggleTheme);

    function toggleTheme() {
        body.classList.toggle('dark-theme');
    }
});

document.getElementById('homeButton').addEventListener('click', function() {
    window.location.href = 'index.html';
});

async function searchMovies() {
    const theaterId = document.getElementById('theater').value;
    const apiUrl = `https://www.finnkino.fi/xml/Schedule/?area=${theaterId}`;

    try {
        const response = await fetch(apiUrl);
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        const movies = xmlDoc.getElementsByTagName('Show');

        displayMovies(movies);
    } catch (error) {
        console.error('Virhe elokuvien aikataulua haettaessa:', error);
        
        // Error viesti
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Virhe elokuvien aikataulua haettaessa. Yritä myöhemmin uudelleen.';
        errorMessage.style.color = 'red';

        const container = document.querySelector('.container');
        container.innerHTML = '';
        container.appendChild(errorMessage);
    }
}

async function getMovieDetails(movieId) {
    const apiUrl = `https://www.finnkino.fi/xml/Events/?eventID=${movieId}`;

    try {
        const response = await fetch(apiUrl);
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

        // Hakee elokuvan tiedot XML:stä
        const genre = xmlDoc.getElementsByTagName('Genres').length > 0 ? xmlDoc.getElementsByTagName('Genres')[0].textContent : 'Tietoja ei saatavilla';
        const director = xmlDoc.getElementsByTagName('Director').length > 0 ? xmlDoc.getElementsByTagName('Director')[0].textContent : 'Tietoja ei saatavilla';
        const actors = xmlDoc.getElementsByTagName('Actors').length > 0 ? xmlDoc.getElementsByTagName('Actors')[0].textContent : 'Tietoja ei saatavilla';
        const duration = xmlDoc.getElementsByTagName('LengthInMinutes').length > 0 ? xmlDoc.getElementsByTagName('LengthInMinutes')[0].textContent : 'Tietoja ei saatavilla';
        const ageRating = xmlDoc.getElementsByTagName('Rating').length > 0 ? xmlDoc.getElementsByTagName('Rating')[0].textContent : 'Tietoja ei saatavilla';
        const shortSynopsis = xmlDoc.getElementsByTagName('ShortSynopsis').length > 0 ? xmlDoc.getElementsByTagName('ShortSynopsis')[0].textContent : 'Tietoja ei saatavilla';

        return {
            genre,
            director,
            actors,
            duration,
            ageRating,
            shortSynopsis // Lyhyt juonikuvaus
        };
    } catch (error) {
        console.error('Virhe elokuvan tietojen hakemisessa:', error);
        return {
            genre: 'Tietoja ei saatavilla',
            director: 'Tietoja ei saatavilla',
            actors: 'Tietoja ei saatavilla',
            duration: 'Tietoja ei saatavilla',
            ageRating: 'Tietoja ei saatavilla',
            shortSynopsis: 'Tietoja ei saatavilla'
        };
    }
}


// Ajan muotoilu suomen kielelle
function formatTime(dateTimeStr) {
    const dateTime = new Date(dateTimeStr);
    const hours = dateTime.getHours().toString().padStart(2, '0');
    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

async function displayMovies(movies) {
    const moviesDiv = document.getElementById('movies');
    moviesDiv.innerHTML = '';

    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        const title = movie.getElementsByTagName('Title')[0].textContent;
        const image = movie.getElementsByTagName('EventLargeImagePortrait')[0].textContent;
        const startTime = movie.getElementsByTagName('dttmShowStart')[0].textContent;
        const endTime = movie.getElementsByTagName('dttmShowEnd')[0].textContent;
        const movieId = movie.getElementsByTagName('EventID')[0].textContent;
        const date = new Date(startTime).toLocaleDateString('fi-FI'); // Lisätään päivämäärä näytösaikaan

        // Lisätiedot elokuvalle
        const movieDetails = await getMovieDetails(movieId);
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');

        const img = document.createElement('img');
        img.src = image;
        movieDiv.appendChild(img);

        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        movieDiv.appendChild(titleElement);

        const dateElement = document.createElement('p');
        dateElement.innerHTML = `<strong>Näytöksen päivämäärä:</strong> ${date}`;
        movieDiv.appendChild(dateElement);

        const showTimeElement = document.createElement('p');
        showTimeElement.innerHTML = `<strong>Näytös alkaa:</strong> ${formatTime(startTime)}<br><strong>Päättyy:</strong> ${formatTime(endTime)}`;
        movieDiv.appendChild(showTimeElement);

        // Elokuvan lisätiedot
        const genreElement = document.createElement('p');
        genreElement.innerHTML = `<strong>Genre:</strong> ${movieDetails.genre}`;
        movieDiv.appendChild(genreElement);

        const directorElement = document.createElement('p');
        directorElement.innerHTML = `<strong>Ohjaaja:</strong> ${movieDetails.director}`;
        movieDiv.appendChild(directorElement);

        const actorsElement = document.createElement('p');
        actorsElement.innerHTML = `<strong>Näyttelijät:</strong> ${movieDetails.actors}`;
        movieDiv.appendChild(actorsElement);

        // Convert duration from minutes to hours
        const durationHours = Math.floor(parseInt(movieDetails.duration) / 60);
        const durationMinutes = parseInt(movieDetails.duration) % 60;
        const durationText = `${durationHours} t ${durationMinutes} min`;

        const durationElement = document.createElement('p');
        durationElement.innerHTML = `<strong>Kesto:</strong> ${durationText}`;
        movieDiv.appendChild(durationElement);

        const ageRatingElement = document.createElement('p');
        ageRatingElement.innerHTML = `<strong>Ikäraja:</strong> ${movieDetails.ageRating}`;
        movieDiv.appendChild(ageRatingElement);

        // Tummennettu juonikuvauksen otsikko ja teksti
        const plotTitleElement = document.createElement('p');
        plotTitleElement.innerHTML = `<strong>Juoni:</strong> ${movieDetails.shortSynopsis}`;
        movieDiv.appendChild(plotTitleElement);

        moviesDiv.appendChild(movieDiv);
    }
}