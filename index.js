let animeHistory = []
const API_BASE = 'https://api.jikan.moe/'
const API_ANIME = API_BASE + 'anime/'
const HISTORY_STORAGE_KEY = 'PWA_EXAMPLE_BUILD_HISTORY_KEY'

installServiceWorkerAsync()

document
	.querySelector('.input-element button')
	.addEventListener('click', onOkButtonClickAsync)
document.body.addEventListener('click', removeParent)

const buildAnimeMarkup = anime => {
	return `
        <li>
            <img src="${anime.image_url}">
            <h3>${anime.title}</h3>
            <time>${
				anime.premiered ? anime.premiered : 'No Date Provided'
			}</time>
        </li>
    `
}

function updateHistory(anime) {
	animeHistory.push(anime)
	localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(animeHistory))
	addAnimeToHistoryTag(anime)
}

function addAnimeToHistoryTag(anime) {
	document.querySelector('.history ul').innerHTML =
		buildAnimeMarkup(anime) +
		document.querySelector('.history ul').innerHTML
}

async function onOkButtonClickAsync() {
	let targetElement = document.querySelector('main ul')
	let animeId = document.querySelector('.input-element input').value
	try {
		const response = await fetch(API_ANIME + animeId)
		if (!response.ok) {
			const alertBox = document.createElement('div')
			alertBox.classList.add('error-alert')
			alertBox.innerHTML = `
                <button>+</button>
                <p>There was a (${
					response.status
				}) error from API provider. Please try another id.</p>
            `
			document.body.appendChild(alertBox)
			return
		}
		let anime = await response.json()
		targetElement.innerHTML = buildAnimeMarkup(anime)

		updateHistory(anime)
	} catch (err) {
		console.error(`error ${err}`)
	}
}

function removeParent(evt) {
	if (evt.target.parentElement.classList.contains('error-alert')) {
		evt.target.parentElement.remove()
	}
}

async function installServiceWorkerAsync() {
	console.log('Install Service Worker')
	const history = getLocalHistory()

	if (history !== null) {
		animeHistory = history
		animeHistory.forEach(anime => addAnimeToHistoryTag(anime))
	}
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./serviceworker.js').then(
			function(registration) {
				// Registration was successful
				console.log(
					'ServiceWorker registration successful with scope: ',
					registration.scope
				)
			},
			function(err) {
				// registration failed :(
				console.log('ServiceWorker registration failed: ', err)
			}
		)
	}
}

function getLocalHistory() {
	return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY))
}
