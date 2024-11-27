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
					<div className="relative aspect-square overflow-hidden rounded-lg">
						<div className="absolute inset-0 ">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative w-[70%] aspect-square ">
									<div
										className={`absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 ${
											error ? "border-red-500" : packageStatus ? "border-green-500" : "border-primary"
										}`}
									></div>
									<div
										className={`absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 ${
											error ? "border-red-500" : packageStatus ? "border-green-500" : "border-primary"
										}`}
									></div>
									<div
										className={`absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 ${
											error ? "border-red-500" : packageStatus ? "border-green-500" : "border-primary"
										}`}
									></div>
									<div
										className={`absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 ${
											error ? "border-red-500" : packageStatus ? "border-green-500" : "border-primary"
										}`}
									></div>
								</div>
							</div>
						</div>
						<video ref={ref} className="w-full h-full object-cover" />
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
