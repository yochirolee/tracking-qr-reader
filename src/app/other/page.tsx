"use client";
import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const QRScanner = () => {
	const videoRef = useRef(null);
	const [qrCodeData, setQrCodeData] = useState<string[]>([]);

	useEffect(() => {
		let qrScanner: QrScanner | null = null;

		if (videoRef.current) {
			qrScanner = new QrScanner(
				videoRef.current,
				(result) => {
					console.log("Decoded QR code:", result.data);
					setQrCodeData((prev) => [...prev, result.data]);
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
			{qrCodeData.map((data, index) => (
				<p className="border p-2" key={index}>
					QR Code Data: {data}
				</p>
			))}
		</div>
	);
};

export default QRScanner;
