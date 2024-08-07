document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
    const searchInput = document.getElementById('search-bar');
    const typeFilter = document.getElementById('type-filter');
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonDetail = document.getElementById('pokemon-detail');
    const modal = document.getElementById('pokemon-modal');
    const span = document.getElementsByClassName('close')[0];
    const loading = document.getElementById('loading');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageNumbers = document.getElementById('page-numbers');
    let currentPage = 1;
    const limit = 20;
    const maxPages = 21;

    async function fetchPokemonList(url = `${apiUrl}?limit=${limit}&offset=0`) {
        loading.style.display = 'block';
        try {
            const response = await fetch(url);
            const data = await response.json();
            displayPokemonList(data.results);
            updatePagination();
        } catch (error) {
            console.error('Error fetching Pokémon list:', error);
        } finally {
            loading.style.display = 'none';
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

    async function fetchEvolutionChain(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
        }
    }

    async function displayPokemonDetail(pokemon) {
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        const evolutionChain = await fetchEvolutionChain(speciesData.evolution_chain.url);

        let evolutionHtml = '<h3>Evolution Chain</h3><ul>';
        let currentEvolution = evolutionChain.chain;

        while (currentEvolution) {
            evolutionHtml += `<li>${currentEvolution.species.name}</li>`;
            currentEvolution = currentEvolution.evolves_to[0];
        }
        evolutionHtml += '</ul>';

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
            ${evolutionHtml}
        `;
        modal.style.display = 'block';
    }

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

    typeFilter.addEventListener('change', async (event) => {
        const type = event.target.value;
        if (type) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
                const data = await response.json();
                const pokemons = data.pokemon.map(p => p.pokemon);
                displayPokemonList(pokemons);
            } catch (error) {
                console.error('Error fetching Pokémon by type:', error);
            }
        } else {
            fetchPokemonList();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPokemonList(`${apiUrl}?limit=${limit}&offset=${(currentPage - 1) * limit}`);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < maxPages) {
            currentPage++;
            fetchPokemonList(`${apiUrl}?limit=${limit}&offset=${(currentPage - 1) * limit}`);
        }
    });

    function updatePagination() {
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= maxPages; i++) {
            const pageNumber = document.createElement('button');
            pageNumber.textContent = i;
            pageNumber.classList.add('page-number');
            if (i === currentPage) {
                pageNumber.classList.add('active');
            }
            pageNumber.addEventListener('click', () => {
                currentPage = i;
                fetchPokemonList(`${apiUrl}?limit=${limit}&offset=${(currentPage - 1) * limit}`);
            });
            pageNumbers.appendChild(pageNumber);
        }
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === maxPages;
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    fetchPokemonList();
});