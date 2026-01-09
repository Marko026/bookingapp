"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Fix for default marker icon missing in Leaflet + React
const icon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

interface MapPickerProps {
	initialLat?: number;
	initialLng?: number;
	onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({
	position,
	setPosition,
	onLocationSelect,
}: {
	position: L.LatLng | null;
	setPosition: (pos: L.LatLng) => void;
	onLocationSelect: (lat: number, lng: number) => void;
}) {
	const map = useMapEvents({
		click(e) {
			setPosition(e.latlng);
			onLocationSelect(e.latlng.lat, e.latlng.lng);
			map.flyTo(e.latlng, map.getZoom());
		},
	});

	return position === null ? null : (
		<Marker
			position={position}
			icon={icon}
			draggable={true}
			eventHandlers={{
				dragend: (e) => {
					const marker = e.target;
					const position = marker.getLatLng();
					setPosition(position);
					onLocationSelect(position.lat, position.lng);
				},
			}}
		/>
	);
}

export default function MapPicker({
	initialLat,
	initialLng,
	onLocationSelect,
}: MapPickerProps) {
	const [position, setPosition] = useState<L.LatLng | null>(null);

	useEffect(() => {
		if (initialLat && initialLng) {
			setPosition(new L.LatLng(initialLat, initialLng));
		}
	}, [initialLat, initialLng]);

	// Default center: Golubac, Serbia
	const defaultCenter = [44.654, 21.631] as [number, number];

	return (
		<div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
			<MapContainer
				center={position || defaultCenter}
				zoom={13}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<LocationMarker
					position={position}
					setPosition={setPosition}
					onLocationSelect={onLocationSelect}
				/>
			</MapContainer>
		</div>
	);
}
