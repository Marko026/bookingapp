"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Fix for default marker icon missing in Leaflet + React
const icon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

interface LocationMapProps {
	lat: number;
	lng: number;
	popupText?: string;
}

export default function LocationMap({ lat, lng, popupText }: LocationMapProps) {
	return (
		<div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
			<MapContainer
				center={[lat, lng]}
				zoom={15}
				scrollWheelZoom={false}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={[lat, lng]} icon={icon}>
					<Popup>{popupText || "Apartment Location"}</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
}
