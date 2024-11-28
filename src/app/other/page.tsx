"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";

export default function QRScanner() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [qrContent, setQrContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const startVideo = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				}
			} catch (err) {
				console.error("Error accessing camera:", err);
				setError("Unable to access camera.");
			}
		};

		startVideo();

		return () => {
			if (videoRef.current && videoRef.current.srcObject) {
				const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
				tracks.forEach((track) => track.stop());
			}
		};
	}, []);

	useEffect(() => {
		const detectQR = () => {
			if (!canvasRef.current || !videoRef.current) return;

			const video = videoRef.current;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			// Dibujar el video en el canvas
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			// Obtener los datos del canvas
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Detectar QR con jsQR
			const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

			if (qrCode) {
				setQrContent(qrCode.data);

				// Dibujar un marco alrededor del QR detectado
				ctx.beginPath();
				ctx.moveTo(qrCode.location.topLeftCorner.x, qrCode.location.topLeftCorner.y);
				ctx.lineTo(qrCode.location.topRightCorner.x, qrCode.location.topRightCorner.y);
				ctx.lineTo(qrCode.location.bottomRightCorner.x, qrCode.location.bottomRightCorner.y);
				ctx.lineTo(qrCode.location.bottomLeftCorner.x, qrCode.location.bottomLeftCorner.y);
				ctx.closePath();
				ctx.strokeStyle = "red";
				ctx.lineWidth = 4;
				ctx.stroke();
			} else {
				setQrContent(null);
			}
		};

		const interval = setInterval(detectQR, 100); // Analizar cada 100 ms

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative">
			<video ref={videoRef} className="w-full h-auto" />
			<canvas
				ref={canvasRef}
				className="absolute top-0 left-0 w-full h-full"
				style={{ pointerEvents: "none" }}
			></canvas>
			<div className="mt-4">
				{qrContent ? (
					<p className="text-green-600">QR Content: {qrContent}</p>
				) : (
					<p className="text-gray-600">Scanning for QR codes...</p>
				)}
				{error && <p className="text-red-600">{error}</p>}
			</div>
		</div>
	);
}
