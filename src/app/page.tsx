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
import { Package, QrCode, AlertCircle, Flashlight } from "lucide-react";
import { useZxing } from "react-zxing";
import { Badge } from "@/components/ui/badge";

export default function PackageScanner() {
	const [scanning, setScanning] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [packageStatus, setPackageStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [scannedPackages, setScannedPackages] = useState<string[]>([]);
	const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);
	const [torchEnabled, setTorchEnabled] = useState(false);

	// Initialize audio after component mounts
	useEffect(() => {
		setSuccessSound(new Audio("/success-beep.mp3"));
	}, []);

	const { ref, torch } = useZxing({
		paused: !scanning,
		constraints: {
			video: {
				facingMode: "environment",
				width: { ideal: 640, min: 480 }, // Reduced for low-res devices
				height: { ideal: 480, min: 320 },
				aspectRatio: 1.777777778, // 16:9 ratio
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

	const toggleTorch = async () => {
		try {
			if (torchEnabled) {
				await torch.off();
			} else {
				await torch.on();
			}
			setTorchEnabled(!torchEnabled);
		} catch (error) {
			console.error("Torch not supported:", error);
			setError("Torch not supported on this device.");
		}
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
								advanced: [
									{
										focusMode: "continuous",
									} as any,
								],
							});
						}
					}
				}
			}
		} catch (error) {
			console.error("Error setting focus:", error);
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
					<div className="aspect-square overflow-hidden mx-auto rounded-lg relative border-gray-300">
						<video ref={ref} className="w-full h-full object-cover" onClick={triggerFocus} />
						<div className="absolute p-4 inset-0 flex items-center justify-center pointer-events-none">
							<div className="relative w-60 h-60">
								<div
									className={`absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 ${
										error
											? "border-red-500"
											: packageStatus
											? "border-green-500"
											: "border-foreground"
									}`}
								></div>
								<div
									className={`absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 ${
										error
											? "border-red-500"
											: packageStatus
											? "border-green-500"
											: "border-foreground"
									}`}
								></div>
								<div
									className={`absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 ${
										error
											? "border-red-500"
											: packageStatus
											? "border-green-500"
											: "border-foreground"
									}`}
								></div>
								<div
									className={`absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 ${
										error
											? "border-red-500"
											: packageStatus
											? "border-green-500"
											: "border-foreground"
									}`}
								></div>
								<div className="absolute inset-0 flex items-center justify-center">
									<span
										className={`text-sm font-medium ${
											error
												? "text-red-500"
												: packageStatus
												? "text-green-500"
												: "text-foreground/10"
										} bg-black/10 px-2 py-1 rounded`}
									>
										{error ? "Error" : packageStatus ? "Found" : "Tap to focus"}
									</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="aspect-square bg-muted mx-auto flex items-center justify-center rounded-lg">
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
								<li className="border p-2 my-1 rounded-md" key={index}>
									{pkg}
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				<Button onClick={toggleTorch} className="w-full">
					{torchEnabled ? "Turn Off Flash" : "Turn On Flash"}
				</Button>
				<Button onClick={startScanning} className="w-full">
					{scanning ? "Cancel Scan" : "Scan Package"}
				</Button>
			</CardFooter>
		</Card>
	);
}
