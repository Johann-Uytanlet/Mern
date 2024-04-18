import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L, {Icon, icon} from 'leaflet';
import tryIcon from '../assets/try.png'; 
import DraggableMarker from './customMarker';
import ReviewMarker from './reviewMarker';
import BACKEND_URL from '../../config.js';
import MarkerDetails from './MarkerDetails/MarkerDetails'

function MapComponent() {
    const [markers, setMarkers] = useState([]); // Array to store marker data
    const [selectedMarker, setSelectedMarker] = useState(null); // State to store selected marker
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar visibility
    const [showMarkerDetails, setShowMarkerDetails] = useState(false);

    useEffect(() => {
      const fetchingData = async () =>{
        try{
          	await fetchMarkers();
        } catch (err) {
          	console.log(err);
        }
      }
      fetchingData();
    }, []);

    const fetchMarkers = async () => {
		console.log("before getallmarkers");
		try {
			console.log("before getallmarkers");
			const response = await fetch(`${BACKEND_URL}/getAllMarkers`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			if( response.ok ) {
				const data = await response.json();
				setMarkers(data);
			} else {
				const errorData = await response.json();
				console.error('Error fetching markers:', errorData.error);
			}
		} catch (error) {
			console.error('Error fetching markers:', error);
		}
    };

    async function createMarker( name, lat, lng ) {
      try {
          const form = {
              location: name, 
              lat: lat,
              lng: lng
          };
  
          const response = await fetch(`${BACKEND_URL}/createMarker`, {
              method:'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
          });
          
          if( response.ok ) {
              fetchMarkers();
          }

      } catch(error) {
        console.error('Error creating marker:', error);
      }
    };

    function MyMarkers({ markers }) {
      console.log(markers);
      return (
        <>
			{markers.map((marker, index) => (
				<ReviewMarker key={index} data={marker} onMarkerClick={handleMarkerClick} />
			))}
        </>
      );
    }

    function generateStarRating(rating) {
		if (rating < 0 || rating > 5) {
			return 'Invalid rating value.';
		}
		else if(isNaN(rating)){
			return 'No ratings yet, please add one'
		}

		const fullStar = '★';
		const emptyStar = '☆';
		let starString = '';

		for (let i = 0; i < Math.floor(rating); i++) {
			starString += fullStar;
		}

		const decimalPart = rating - Math.floor(rating);
		if (decimalPart > 0) {
			starString += fullStar.slice(0, 1); // Add half star if needed
		}

		for (let i = Math.floor(rating) + (decimalPart > 0 ? 1 : 0); i < 5; i++) {
			starString += emptyStar;
		}

		return starString;
    };

    function MyComponent() {
        const map = useMapEvents({
			click: async (e) => {
				const name = prompt('What is the name of the building?');     
				const { lat, lng } = e.latlng;

        if( !name || name == '' || name == undefined ) {
          return null;
        } 

				try { 
					await createMarker(name, lat, lng);				
				} catch( error ) {
					console.log( "Marker creation failed")
				}
			}
        });
		return null;
    }

    const handleMarkerClick = (data) => {
      setSelectedMarker(data);
      setShowMarkerDetails(true);
    };
  
    const closeMarkerDetails = () => {
      setShowMarkerDetails(false);
    };

    
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {showMarkerDetails && (
          <div className="marker-details-container">
            <MarkerDetails markerData={selectedMarker} onClose={closeMarkerDetails} generateStarRating={generateStarRating} />
          </div>
        )}
        <MapContainer center={[14.586598,120.976342]} zoom={20} style={{ height: '900px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MyComponent />
        <MyMarkers markers={markers} />
        </MapContainer>
      </div>
    );
}

export default MapComponent;