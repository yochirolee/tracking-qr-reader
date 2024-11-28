"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Package, QrCode, AlertCircle } from "lucide-react";
import { useZxing } from "react-zxing";
import { Badge } from "@/components/ui/badge";

export default function PackageScanner() {
	const [scanning, setScanning] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [packageStatus, setPackageStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [scannedPackages, setScannedPackages] = useState<string[]>([]);
	const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);

	// Initialize audio after component mounts
	useEffect(() => {
		setSuccessSound(new Audio("/success-beep.mp3"));
	}, []);

	const { ref, torch } = useZxing({
		paused: !scanning,
		constraints: {
			video: {
				facingMode: "environment",
				width: { ideal: 1280, min: 720 },
				height: { ideal: 720, min: 480 },
				aspectRatio: 1.777778,
			},
		},

		onDecodeResult(result) {
			const scannedCode = result.getText().split(",")[1];

			if (scannedPackages.includes(scannedCode)) {
				setError("Package already scanned!");
				setTimeout(() => {
					setError(null);
				}, 1500);
				return;
			}

			successSound?.play();
			setResult(scannedCode);
			const status = "Package found";
			setPackageStatus(status);
			setError(null);
			setScannedPackages((prev) => [...prev, scannedCode]);

			setTimeout(() => {
				setResult(null);
				setPackageStatus(null);
			}, 1500);
		},
		onError(error) {
			setError("Error scanning code. Please try again.");
			console.error(error);
		},
	});

	const startScanning = () => {
		setScanning(!scanning);
		setResult(null);
		setPackageStatus(null);
		setError(null);
	};

	const triggerFocus = async () => {
		try {
			if (ref.current) {
				const stream = ref.current.srcObject as MediaStream | null;
				if (stream) {
					const track = stream.getVideoTracks()[0];
					if (track) {
						const capabilities = track.getCapabilities();
						if ((capabilities as any).focusMode) {
							await track.applyConstraints({
								advanced: [{
									focusMode: 'continuous'
								} as any]
							});
						}
					}
				}
			}
		} catch (error) {
			console.error('Error setting focus:', error);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Package className="w-6 h-6" />
					Package Tracker
				</CardTitle>
				<CardDescription>Scan QR code or barcode to track your package</CardDescription>
			</CardHeader>
			<CardContent>
				{scanning ? (
					<div className="relative">
						<video ref={ref} className="w-full aspect-video rounded-lg" onClick={triggerFocus} />
						<div className="absolute inset-0 pointer-events-none">
							<div className="w-48 h-48 border-2 border-white/50 rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-xs text-white/75">Tap to focus</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
						<QrCode className="w-16 h-16 text-muted-foreground" />
					</div>
				)}
				{error && (
					<Alert variant="destructive" className="mt-4">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{scannedPackages.length > 0 && (
					<div className="mt-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Scanned Packages</h3>
							<Badge variant="outline">{scannedPackages.length}</Badge>
						</div>
						<ul className="my-2">
							{scannedPackages.map((pkg, index) => (
								<li className=" border p-2 my-1 rounded-md" key={index}>
									{pkg}
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
			<CardFooter>
				<Button onClick={startScanning} className="w-full">
					{scanning ? "Cancel Scan" : "Scan Package"}
				</Button>
			</CardFooter>
		</Card>
	);
}
