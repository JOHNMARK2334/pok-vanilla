document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
    const searchInput = document.getElementById('search-bar');
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonDetail = document.getElementById('pokemon-detail');
    const modal = document.getElementById('pokemon-modal');
    const span = document.getElementsByClassName('close')[0];

    // Fetch and display a list of Pokémon
    async function fetchPokemonList() {
        try {
            const response = await fetch(`${apiUrl}?limit=151`); // First generation Pokémon
            const data = await response.json();
            displayPokemonList(data.results);
        } catch (error) {
            console.error('Error fetching Pokémon list:', error);
        }
    }

    async function fetchPokemonData(pokemon) {
        try {
            const response = await fetch(pokemon.url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${pokemon.name}:`, error);
        }
    }

    async function displayPokemonList(pokemons) {
        pokemonList.innerHTML = '';
        for (const pokemon of pokemons) {
            const pokemonData = await fetchPokemonData(pokemon);
            if (pokemonData) {
                const pokemonCard = document.createElement('div');
                pokemonCard.classList.add('pokemon-card');
                pokemonCard.innerHTML = `
                    <img src="${pokemonData.sprites.front_default}" alt="${pokemon.name}">
                    <p>${pokemon.name}</p>
                    <button onclick="fetchPokemonDetail('${pokemon.url}')">View Details</button>
                `;
                pokemonList.appendChild(pokemonCard);
            }
        }
    }

    window.fetchPokemonDetail = async function(url) {
        try {
            const response = await fetch(url);
            const pokemon = await response.json();
            displayPokemonDetail(pokemon);
        } catch (error) {
            console.error('Error fetching Pokémon detail:', error);
        }
    };

    function displayPokemonDetail(pokemon) {
        pokemonDetail.innerHTML = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height}</p>
            <p>Weight: ${pokemon.weight}</p>
            <p>Base Experience: ${pokemon.base_experience}</p>
            <h3>Abilities</h3>
            <ul>${pokemon.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}</ul>
            <h3>Stats</h3>
            <ul>${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}</ul>
        `;
        modal.style.display = 'block';
    }

    // Search Pokémon
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.toLowerCase();
        if (query) {
            try {
                const response = await fetch(`${apiUrl}${query}`);
                const pokemon = await response.json();
                displayPokemonList([{ name: pokemon.name, url: `${apiUrl}${pokemon.id}` }]);
            } catch (error) {
                console.error('Error fetching Pokémon:', error);
            }
        } else {
            fetchPokemonList();
        }
    });

    // Close the modal
    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    // Initialize app by fetching Pokémon list
    fetchPokemonList();
});
