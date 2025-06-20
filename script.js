document.addEventListener("DOMContentLoaded", function() {
    let findStoreButton = document.getElementById("findStoreButton");
    let mapDiv = document.getElementById("map");
    let map = null; // Store the map instance

    findStoreButton.addEventListener("click", function() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        findStoreButton.disabled = true;
        findStoreButton.textContent = "Locating...";

        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            mapDiv.style.display = "block";

            // If map already exists, remove it before creating a new one
            if (map !== null) {
                map.remove();
            }
            map = L.map('map').setView([lat, lon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
                .bindPopup('You are here').openPopup();

            // Overpass API query for biltong stores or butchers nearby
            const radius = 5000; // 5km
            const query = `
                [out:json];
                (
                  node["shop"="butcher"](around:${radius},${lat},${lon});
                  node["name"~"biltong",i](around:${radius},${lat},${lon});
                );
                out center;
            `;

            fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query
            })
            .then(response => response.json())
            .then(data => {
               if (data.elements.length === 0) {
                    L.popup()
                        .setLatLng([lat, lon])
                        .setContent("No biltong stores found nearby.")
                        .openOn(map);
                    fetch('biltong_stores.json')
                        .then(response => response.json())
                        .then(stores => displayCuratedStores(stores));
                    return;
                } else {
                    document.getElementById('curatedStoresContainer').innerHTML = "";
                }
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        L.marker([element.lat, element.lon]).addTo(map)
                            .bindPopup(element.tags.name || "Biltong Store / Butcher");
                    }
                });
            })
            .catch(() => {
                alert("Could not fetch store data.");
            })
            .finally(() => {
                findStoreButton.disabled = false;
                findStoreButton.textContent = "Find a Biltong Store Near Me";
            });

        }, function() {
            alert("Unable to retrieve your location.");
            findStoreButton.disabled = false;
            findStoreButton.textContent = "Find a Biltong Store Near Me";
        });
    });
});

function displayCuratedStores(stores) {
    const container = document.getElementById('curatedStoresContainer');
    if (!container) return;
    container.innerHTML = `
        <h3>Popular Biltong Stores</h3>
        <ul>
            ${stores.map(store => `
                <li>
                    <strong>${store.name}</strong> (${store.city}) 
                    <a href="${store.url}" target="_blank">Visit</a>
                    <span style="color:#FFB74D;">&#9733; ${store.rating}</span>
                </li>
            `).join('')}
        </ul>
    `;
}