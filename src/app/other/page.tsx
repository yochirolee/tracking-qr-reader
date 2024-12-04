"use client";
import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const QRScanner = () => {
	const videoRef = useRef(null);
	const [qrCodeData, setQrCodeData] = useState<string[]>([]);
	const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);

	useEffect(() => {
		setSuccessSound(new Audio("/success-beep.mp3"));
	}, []);

	useEffect(() => {
		let qrScanner: QrScanner | null = null;

		if (videoRef.current) {
			qrScanner = new QrScanner(
					videoRef.current,
					(result) => {
						console.log("Decoded QR code:", result.data);
						setQrCodeData((prev) => [...prev, result.data]);
						successSound?.play();
					},
					{
						highlightScanRegion: true,
						highlightCodeOutline: true,
						maxScansPerSecond: 1,
					},
			);

			qrScanner.start();

			return () => {
				qrScanner?.stop();
			};
		}
	}, [successSound]);

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
