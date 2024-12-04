"use client";
import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const QRScanner = () => {
	const videoRef = useRef(null);
	const [qrCodeData, setQrCodeData] = useState("");

	useEffect(() => {
		let qrScanner: QrScanner | null = null;

		if (videoRef.current) {
			qrScanner = new QrScanner(
				videoRef.current,
				(result) => {
					console.log("Decoded QR code:", result.data);
					setQrCodeData(result.data);
				},
				{
					highlightScanRegion: true,
					highlightCodeOutline: true,
				},
			);

			qrScanner.start();

			// Clean up when component unmounts
			return () => {
				qrScanner?.stop();
			};
		}
	}, []);

	return (
		<div>
			<video ref={videoRef} style={{ width: "100%" }}></video>
			<p>QR Code Data: {qrCodeData}</p>
		</div>
	);
};

export default QRScanner;
