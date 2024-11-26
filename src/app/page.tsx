"use client";

import { useState } from "react";
import { QrReader } from "react-qr-reader";
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

export default function PackageScanner() {
	const [scanning, setScanning] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [packageStatus, setPackageStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleScan = (data: string | null) => {
		if (data) {
			setScanning(false);
			setResult(data);
			const status = "Package found";
			setPackageStatus(status);
			setError(null);
		}
	};

	const handleError = (err: Error) => {
		setError("Error scanning code. Please try again.");
		console.error(err);
	};

	const startScanning = () => {
		setScanning(true);
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
					<div className="aspect-square overflow-hidden rounded-lg">
						<QrReader
							onResult={(result) => result && handleScan(result.getText())}
							onError={handleError}
							constraints={{ facingMode: "environment" }}
						/>
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
				{result && packageStatus && (
					<Alert className="mt-4">
						<Package className="h-4 w-4" />
						<AlertTitle>Package Status</AlertTitle>
						<AlertDescription>
							Tracking number: {result}
							<br />
							Status: {packageStatus}
						</AlertDescription>
					</Alert>
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
