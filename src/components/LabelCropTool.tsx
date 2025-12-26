import { useState, useRef, useEffect, useCallback } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { Upload, Download, RotateCw, ZoomIn, ZoomOut, Maximize2, X, FileText } from 'lucide-react';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface LabelCropToolProps {
    marketplace: 'flipkart' | 'meesho' | 'amazon' | 'myntra' | 'snapdeal';
}

interface ProcessedFile {
    file: File;
    canvas: HTMLCanvasElement;
    processed: boolean;
}

export function LabelCropTool({ marketplace }: Readonly<LabelCropToolProps>) {
    const [files, setFiles] = useState<File[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDragOver, setIsDragOver] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const LABEL_SIZE_MM = {
        flipkart: { width: 100, height: 148 },
        meesho: { width: 100, height: 150 },
        amazon: { width: 102, height: 152 },
        myntra: { width: 100, height: 152 },
        snapdeal: { width: 105, height: 148 }
    };

    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [currentPreviewIndex]);

    const MARKET_COPY: Record<LabelCropToolProps['marketplace'], { title: string; note: string; accent: string }> = {
        flipkart: {
            title: 'Flipkart Label Crop',
            note: 'Optimized 100×148 mm layout with generous padding for barcodes.',
            accent: 'bg-blue-50'
        },
        meesho: {
            title: 'Meesho Label Crop',
            note: 'Tuned for 100×150 mm tickets with tighter aspect tolerance.',
            accent: 'bg-pink-50'
        },
        amazon: {
            title: 'Amazon Label Crop',
            note: 'Sized at 102×152 mm with extra bleed for FNSKU clarity.',
            accent: 'bg-amber-50'
        },
        myntra: {
            title: 'Myntra Label Crop',
            note: 'Standard 100×152 mm format for thermal printing.',
            accent: 'bg-rose-50'
        },
        snapdeal: {
            title: 'Snapdeal Label Crop',
            note: 'A6 sized 105×148 mm layout for standard shipping labels.',
            accent: 'bg-red-50'
        }
    };

    // Enhanced detection for QR codes and barcodes to identify label area
    const detectBarcodeRegions = (
        data: Uint8ClampedArray,
        width: number,
        height: number
    ): { left?: number; right?: number; top?: number; bottom?: number; qrCenter?: { x: number; y: number } } => {
        const barcodeRegions: { left?: number; right?: number; top?: number; bottom?: number; qrCenter?: { x: number; y: number } } = {};
        
        for (let x = 0; x < Math.min(width * 0.25, 200); x++) {
            let lastLum = -1;
            let transitions = 0;
            
            for (let y = 0; y < height; y++) {
                const i = (y * width + x) * 4;
                const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                
                if (lastLum >= 0 && Math.abs(lum - lastLum) > 50) {
                    transitions++;
                }
                lastLum = lum;
            }
            
            if (transitions > height * 0.25) {
                if (!barcodeRegions.left) barcodeRegions.left = x;
                barcodeRegions.right = x;
            }
        }
        
        const qrSize = 60;
        let bestQrScore = 0;
        let bestQrX = 0;
        let bestQrY = 0;
        for (let y = 0; y < Math.min(height * 0.5, 300); y++) {
            for (let x = Math.max(0, width * 0.3); x < width * 0.95; x++) {
                if (x + qrSize >= width || y + qrSize >= height) continue;
                
                let darkPixels = 0;
                let lightPixels = 0;
                const lums: number[] = [];
                
                for (let dy = 0; dy < qrSize; dy++) {
                    for (let dx = 0; dx < qrSize; dx++) {
                        const i = ((y + dy) * width + (x + dx)) * 4;
                        const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        lums.push(lum);
                        if (lum < 128) darkPixels++;
                        else lightPixels++;
                    }
                }
                
                const avgLum = lums.reduce((a, b) => a + b, 0) / lums.length;
                const variance = lums.reduce((sum, lum) => sum + Math.pow(lum - avgLum, 2), 0) / lums.length;
                const score = (darkPixels > qrSize * qrSize * 0.2 && lightPixels > qrSize * qrSize * 0.2) 
                    ? variance : 0;
                
                if (score > bestQrScore) {
                    bestQrScore = score;
                    bestQrX = x;
                    bestQrY = y;
                }
            }
        }
        
        if (bestQrScore > 1000) {
            barcodeRegions.qrCenter = { x: bestQrX + qrSize / 2, y: bestQrY + qrSize / 2 };
            barcodeRegions.top = Math.max(0, bestQrY - 10);
        }
        
        return barcodeRegions;
    };

    // Advanced edge detection for e-commerce labels
    const detectLabelBounds = (
        imageData: ImageData,
        width: number,
        height: number
    ) => {
        try {
            const { data } = imageData;
            
            const barcodeRegions = detectBarcodeRegions(data, width, height);
            
            let labelStartY = 0;
            let labelEndY = height;
            
            if (barcodeRegions.qrCenter) {
                const qrY = barcodeRegions.qrCenter.y;
                labelStartY = Math.max(0, qrY - 150);
                labelEndY = Math.min(height, qrY + 400);
            }
            
            // Calculate row and column densities
            const rowDensities: number[] = [];
            const colDensities: number[] = [];
            
            for (let y = 0; y < height; y++) {
                let rowSum = 0;
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;
                    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    const weight = lum < 128 ? (255 - lum) / 255 * 2 : (255 - lum) / 255;
                    rowSum += weight;
                }
                rowDensities.push(rowSum / width);
            }
            
            for (let x = 0; x < width; x++) {
                let colSum = 0;
                for (let y = 0; y < height; y++) {
                    const i = (y * width + x) * 4;
                    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    const weight = lum < 128 ? (255 - lum) / 255 * 2 : (255 - lum) / 255;
                    colSum += weight;
                }
                colDensities.push(colSum / height);
            }
            
            const sortedRows = [...rowDensities].sort((a, b) => a - b);
            const sortedCols = [...colDensities].sort((a, b) => a - b);
            const rowThreshold = sortedRows[Math.floor(sortedRows.length * 0.05)] * 2.0;
            const colThreshold = sortedCols[Math.floor(sortedCols.length * 0.05)] * 2.0;
            
            // Find content boundaries
            let minY = labelStartY, maxY = labelEndY;
            let minX = 0, maxX = width - 1;
            
            if (barcodeRegions.qrCenter) {
                minY = Math.max(0, barcodeRegions.qrCenter.y - 120);
            } else {
                for (let y = labelStartY; y < Math.min(height, labelStartY + 200); y++) {
                    if (rowDensities[y] > rowThreshold) {
                        minY = Math.max(0, y - 8);
                        break;
                    }
                }
            }
            
            if (barcodeRegions.qrCenter) {
                maxY = Math.min(height, barcodeRegions.qrCenter.y + 350);
            } else {
                for (let y = Math.max(labelStartY, labelEndY - 200); y < labelEndY; y++) {
                    if (rowDensities[y] > rowThreshold) {
                        maxY = Math.min(height - 1, y + 8);
                    }
                }
            }
            
            // Find left edge
            if (barcodeRegions.left !== undefined) {
                minX = Math.max(0, barcodeRegions.left - 10);
            } else {
                for (let x = 0; x < width; x++) {
                    if (colDensities[x] > colThreshold) {
                        minX = Math.max(0, x - 8);
                        break;
                    }
                }
            }
            
            // Find right edge
            for (let x = width - 1; x >= 0; x--) {
                if (colDensities[x] > colThreshold) {
                    maxX = Math.min(width - 1, x + 8);
                    break;
                }
            }
            
            let refinedMinX = minX, refinedMinY = minY, refinedMaxX = maxX, refinedMaxY = maxY;
            let found = false;
            
            const scanMargin = 15;
            const scanStartY = Math.max(0, minY - scanMargin);
            const scanEndY = Math.min(height, maxY + scanMargin);
            
            for (let y = scanStartY; y < scanEndY; y++) {
                for (let x = Math.max(0, minX - scanMargin); x < Math.min(width, maxX + scanMargin); x++) {
                    const i = (y * width + x) * 4;
                    const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    
                    if (lum < 240) {
                        if (x < refinedMinX) refinedMinX = x;
                        if (x > refinedMaxX) refinedMaxX = x;
                        if (y < refinedMinY) refinedMinY = y;
                        if (y > refinedMaxY) refinedMaxY = y;
                        found = true;
                    }
                }
            }
            
            if (found) {
                minX = refinedMinX;
                minY = refinedMinY;
                maxX = refinedMaxX;
                maxY = refinedMaxY;
            }
            
            if (barcodeRegions.qrCenter) {
                const maxLabelHeight = 500;
                if (maxY - minY > maxLabelHeight) {
                    maxY = minY + maxLabelHeight;
                }
            }
            
            // Add padding
            const contentWidth = maxX - minX;
            const contentHeight = maxY - minY;
            const padX = marketplace === 'flipkart' 
                ? Math.max(15, contentWidth * 0.03) 
                : Math.max(10, contentWidth * 0.02);
            const padY = marketplace === 'flipkart'
                ? Math.max(15, contentHeight * 0.03)
                : Math.max(10, contentHeight * 0.02);
            
            const x = Math.max(0, minX - padX);
            const y = Math.max(0, minY - padY);
            const w = Math.min(width, maxX + padX) - x;
            const h = Math.min(height, maxY + padY) - y;
            
            return { x, y, width: w, height: h };
        } catch (e) {
            return null;
        }
    };




    const processFiles = async (fileList: File[]) => {
        const pdfFiles = fileList.filter(f => f.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            alert('Please upload PDF files only');
            return;
        }

        if (pdfFiles.length !== fileList.length) {
            alert(`${fileList.length - pdfFiles.length} non-PDF file(s) were ignored`);
        }

        setFiles(pdfFiles);
        setProcessedFiles([]);
        setCurrentPreviewIndex(0);
        setProcessing(true);
        setProcessingProgress({ current: 0, total: pdfFiles.length });

        const processed: ProcessedFile[] = [];

        for (let i = 0; i < pdfFiles.length; i++) {
            const file = pdfFiles[i];
            setProcessingProgress({ current: i + 1, total: pdfFiles.length });
            
            try {
                const canvas = await handlePdfUpload(file);
                if (canvas) {
                    processed.push({ file, canvas, processed: true });
                    setProcessedFiles([...processed]);
                    if (i === 0) {
                        setCurrentPreviewIndex(0);
                        // Use setTimeout to ensure canvas is ready
                        setTimeout(() => {
                            updatePreview(canvas);
                        }, 100);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        setProcessing(false);
        setProcessingProgress({ current: 0, total: 0 });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(e.target.files || []);
        if (fileList.length > 0) {
            await processFiles(fileList);
        }
        // Reset input
        e.target.value = '';
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const fileList = Array.from(e.dataTransfer.files);
        if (fileList.length > 0) {
            await processFiles(fileList);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newProcessed = processedFiles.filter((_, i) => i !== index);
        setFiles(newFiles);
        setProcessedFiles(newProcessed);
        if (currentPreviewIndex >= newFiles.length) {
            setCurrentPreviewIndex(Math.max(0, newFiles.length - 1));
        }
        if (newProcessed.length > 0 && currentPreviewIndex < newProcessed.length) {
            setTimeout(() => {
                updatePreview(newProcessed[currentPreviewIndex].canvas);
            }, 50);
        }
    };


    const handlePdfUpload = async (pdfFile: File): Promise<HTMLCanvasElement | null> => {
        try {
            const buffer = await pdfFile.arrayBuffer();
            const loadingTask = getDocument({ data: buffer });
            const pdf = await loadingTask.promise;

            if (pdf.numPages === 0) {
                return null;
            }

            // Process first page
            const firstPage = await pdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 3 }); // Higher scale for better quality

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;

            // Fill with white background
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            await firstPage.render({
                canvasContext: tempCtx,
                viewport
            }).promise;

            const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const bounds = detectLabelBounds(imgData, tempCanvas.width, tempCanvas.height);

            let croppedCanvas: HTMLCanvasElement = tempCanvas;

            if (bounds) {
                // Content area fraction check
                const areaFrac = (bounds.width * bounds.height) / (tempCanvas.width * tempCanvas.height);

                if (areaFrac > 0.005) { // 0.5% threshold (more lenient)
                    croppedCanvas = document.createElement('canvas');
                    croppedCanvas.width = bounds.width;
                    croppedCanvas.height = bounds.height;

                    const croppedCtx = croppedCanvas.getContext('2d')!;
                    croppedCtx.fillStyle = 'white';
                    croppedCtx.fillRect(0, 0, bounds.width, bounds.height);

                    const croppedImageData = tempCtx.getImageData(
                        bounds.x,
                        bounds.y,
                        bounds.width,
                        bounds.height
                    );
                    croppedCtx.putImageData(croppedImageData, 0, 0);
                }
            }

            return croppedCanvas;

        } catch (error) {
            console.error('PDF processing error:', error);
            return null;
        }
    };

    // Create preview/export canvas with cropped image scaled to marketplace size
    const createMarketplaceCanvas = useCallback((sourceCanvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        const scale = Math.min(targetWidth / sourceCanvas.width, targetHeight / sourceCanvas.height);
        const w = sourceCanvas.width * scale;
        const h = sourceCanvas.height * scale;
        const x = (targetWidth - w) / 2;
        const y = (targetHeight - h) / 2;
        
        ctx.drawImage(sourceCanvas, x, y, w, h);
        return canvas;
    }, []);

    const updatePreview = useCallback((sourceCanvas: HTMLCanvasElement) => {
        const canvas = canvasRef.current;
        if (!canvas || !sourceCanvas || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
            return;
        }

        try {
            const size = LABEL_SIZE_MM[marketplace];
            const dpi = 300;
            const exportWidth = (size.width / 25.4) * dpi;
            const exportHeight = (size.height / 25.4) * dpi;
            
            // Create marketplace canvas exactly as export does
            const marketplaceCanvas = createMarketplaceCanvas(sourceCanvas, exportWidth, exportHeight);
            
            // Scale down for display
            const maxDisplayWidth = 900;
            const maxDisplayHeight = 1200;
            const displayScale = Math.min(
                maxDisplayWidth / exportWidth,
                maxDisplayHeight / exportHeight
            );
            
            const displayWidth = Math.round(exportWidth * displayScale);
            const displayHeight = Math.round(exportHeight * displayScale);

            if (displayWidth > 0 && displayHeight > 0) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                const ctx = canvas.getContext('2d', { alpha: false });
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, displayWidth, displayHeight);
                    ctx.drawImage(marketplaceCanvas, 0, 0, displayWidth, displayHeight);
                }
            }
        } catch (error) {
            console.error('Error displaying canvas content:', error);
        }
    }, [marketplace, createMarketplaceCanvas]);

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Pan controls (mouse drag)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left mouse button
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    // Update preview when current index changes
    useEffect(() => {
        if (processedFiles.length > 0 && currentPreviewIndex < processedFiles.length) {
            const canvas = processedFiles[currentPreviewIndex].canvas;
            if (canvas) {
                // Small delay to ensure canvas is ready
                setTimeout(() => {
                    updatePreview(canvas);
                }, 50);
            }
        }
    }, [currentPreviewIndex, processedFiles, updatePreview]);

    const handleExportPdf = async (index?: number) => {
        setProcessing(true);
        try {
            const filesToExport = index !== undefined 
                ? [processedFiles[index]]
                : processedFiles.filter(pf => pf.processed);

            if (filesToExport.length === 0) {
                alert('No processed files to export');
                return;
            }

            if (filesToExport.length === 1) {
                // Single file export - use cropped canvas directly
                const processed = filesToExport[0];
                const sourceCanvas = processed.canvas;
                
                const pdfDoc = await PDFDocument.create();
                const size = LABEL_SIZE_MM[marketplace];
                
                // Convert mm to points (1 mm = 2.83465 points)
                const mmToPt = 2.83465;
                const widthPt = size.width * mmToPt;
                const heightPt = size.height * mmToPt;

                // Create export canvas using same function as preview
                const dpi = 300;
                const exportWidth = (size.width / 25.4) * dpi;
                const exportHeight = (size.height / 25.4) * dpi;
                const exportCanvas = createMarketplaceCanvas(sourceCanvas, exportWidth, exportHeight);

                const blob: Blob = await new Promise((resolve) => {
                    exportCanvas.toBlob((b) => {
                        if (b) resolve(b);
                    }, 'image/png');
                });

                const arrayBuffer = await blob.arrayBuffer();
                const pngImage = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));

                const page = pdfDoc.addPage([widthPt, heightPt]);
                page.drawRectangle({
                    x: 0,
                    y: 0,
                    width: widthPt,
                    height: heightPt,
                    color: rgb(1, 1, 1)
                });
                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: widthPt,
                    height: heightPt
                });

                const pdfBytes = await pdfDoc.save();
                const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${marketplace}-${processed.file.name.replace('.pdf', '')}-label.pdf`;
                a.click();

                URL.revokeObjectURL(url);
            } else {
                // Batch export - merge all into one PDF
                const pdfDoc = await PDFDocument.create();
                const size = LABEL_SIZE_MM[marketplace];
                const mmToPt = 2.83465;
                const widthPt = size.width * mmToPt;
                const heightPt = size.height * mmToPt;

                for (const processed of filesToExport) {
                    const sourceCanvas = processed.canvas;
                    
                    const dpi = 300;
                    const exportWidth = (size.width / 25.4) * dpi;
                    const exportHeight = (size.height / 25.4) * dpi;
                    const exportCanvas = createMarketplaceCanvas(sourceCanvas, exportWidth, exportHeight);

                    const blob: Blob = await new Promise((resolve) => {
                        exportCanvas.toBlob((b) => {
                            if (b) resolve(b);
                        }, 'image/png');
                    });

                    const arrayBuffer = await blob.arrayBuffer();
                    const pngImage = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));

                    const page = pdfDoc.addPage([widthPt, heightPt]);
                    page.drawRectangle({
                        x: 0,
                        y: 0,
                        width: widthPt,
                        height: heightPt,
                        color: rgb(1, 1, 1)
                    });
                    page.drawImage(pngImage, {
                        x: 0,
                        y: 0,
                        width: widthPt,
                        height: heightPt
                    });
                }

                const pdfBytes = await pdfDoc.save();
                const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
                const url = URL.createObjectURL(pdfBlob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `${marketplace}-labels-merged.pdf`;
                a.click();

                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('PDF export error:', e);
            alert('Failed to export PDF: ' + String(e));
        } finally {
            setProcessing(false);
        }
    };


    return (
        <div className="min-h-screen py-10" style={{ background: 'radial-gradient(circle at 12% 20%, var(--accent-soft), transparent 32%), radial-gradient(circle at 82% 12%, rgba(99,102,241,0.12), transparent 36%), var(--surface-muted)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass-card rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold accent-pill uppercase tracking-wide">
                                {MARKET_COPY[marketplace].title}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                PDF only • Auto-crop • Exports match marketplace size
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                            Upload & Crop
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {MARKET_COPY[marketplace].note}
                        </p>
                        {processing && processingProgress.total > 0 && (
                            <div className="glass-card p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                                        Processing {processingProgress.current} of {processingProgress.total} files...
                                    </span>
                                    <span className="text-xs" style={{ color: 'var(--accent)' }}>
                                        {Math.round((processingProgress.current / processingProgress.total) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(processingProgress.current / processingProgress.total) * 100}%`,
                                            background: 'var(--accent)'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            accept=".pdf"
                            id="upload"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`tilt glass-card tilt-inner border-dashed border-2 rounded-xl p-6 flex items-center justify-center cursor-pointer transition-all ${
                                isDragOver ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)]'
                            }`}
                            style={{ background: isDragOver ? 'var(--accent-soft)' : 'var(--surface-muted)' }}
                        >
                            <label htmlFor="upload" className="w-full cursor-pointer">
                                <div className="flex items-center gap-3" style={{ color: 'var(--text)' }}>
                                    <Upload className="w-5 h-5" />
                                    <div className="text-left flex-1">
                                        <div className="font-semibold">
                                            {files.length > 0 
                                                ? `${files.length} file(s) selected` 
                                                : 'Drop PDFs here or click to browse'}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            Upload multiple PDFs at once • Batch processing • Page 1 only
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Files ({files.length}):
                                </div>
                                {files.map((f, idx) => (
                                    <div
                                        key={idx}
                                        className={`glass-card p-3 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                            currentPreviewIndex === idx ? 'ring-2 ring-[var(--accent)]' : ''
                                        }`}
                                        onClick={() => {
                                            if (idx < processedFiles.length) {
                                                setCurrentPreviewIndex(idx);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                            <span className="text-sm truncate" style={{ color: 'var(--text)' }}>
                                                {f.name}
                                            </span>
                                            {idx < processedFiles.length && processedFiles[idx].processed && (
                                                <span className="text-xs px-2 py-0.5 rounded-full accent-pill">Ready</span>
                                            )}
                                        </div>
                                        {idx < processedFiles.length && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExportPdf(idx);
                                                }}
                                                className="p-1 hover:bg-[var(--accent-soft)] rounded transition-colors"
                                                title="Export this file"
                                            >
                                                <Download className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(idx);
                                            }}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Remove file"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                            Smart label detection + padding to protect barcodes
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExportPdf()}
                                disabled={processing || processedFiles.length === 0}
                                className="flex-1 accent-btn py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <RotateCw className="animate-spin w-5 h-5" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                                <span className="font-semibold">
                                    {processedFiles.length > 1 ? `Export All (${processedFiles.length})` : 'Export PDF'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                                Preview
                                {processedFiles.length > 1 && (
                                    <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
                                        ({currentPreviewIndex + 1}/{processedFiles.length})
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {processedFiles.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentPreviewIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentPreviewIndex === 0}
                                            className="px-2 py-1 rounded accent-outline text-xs disabled:opacity-50"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={() => setCurrentPreviewIndex(prev => Math.min(processedFiles.length - 1, prev + 1))}
                                            disabled={currentPreviewIndex === processedFiles.length - 1}
                                            className="px-2 py-1 rounded accent-outline text-xs disabled:opacity-50"
                                        >
                                            →
                                        </button>
                                    </>
                                )}
                                <span className="text-xs px-3 py-1 rounded-full accent-pill">
                                    {MARKET_COPY[marketplace].title.replace(' Label Crop', '')}
                                </span>
                            </div>
                        </div>
                        <div 
                            className="rounded-2xl border relative overflow-hidden" 
                            style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}
                        >
                            <div 
                                className="p-4 min-h-[400px] flex items-center justify-center overflow-hidden relative"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onWheel={handleWheel}
                                style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
                            >
                                {processing && processedFiles.length === 0 ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <RotateCw className="animate-spin w-8 h-8" style={{ color: 'var(--accent)' }} />
                                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {processingProgress.total > 0 
                                                ? `Processing ${processingProgress.current} of ${processingProgress.total}...`
                                                : 'Processing...'}
                                        </span>
                                    </div>
                                ) : processedFiles.length > 0 && currentPreviewIndex < processedFiles.length ? (
                                    <div
                                        style={{
                                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                            transformOrigin: 'center center',
                                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                        }}
                                    >
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full max-h-full"
                                            style={{ 
                                                background: 'white', 
                                                border: '1px dashed var(--border)', 
                                                display: 'block',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Upload PDFs to see preview</p>
                                    </div>
                                )}
                            </div>
                            {processedFiles.length > 0 && currentPreviewIndex < processedFiles.length && (
                                <div className="absolute bottom-4 right-4 flex items-center gap-2 glass-card p-2 rounded-lg">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={zoom <= 0.5}
                                        className="p-1.5 rounded hover:bg-[var(--accent-soft)] disabled:opacity-50 transition-colors"
                                        title="Zoom out"
                                    >
                                        <ZoomOut className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    </button>
                                    <span className="text-xs px-2" style={{ color: 'var(--text)' }}>
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={zoom >= 3}
                                        className="p-1.5 rounded hover:bg-[var(--accent-soft)] disabled:opacity-50 transition-colors"
                                        title="Zoom in"
                                    >
                                        <ZoomIn className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    </button>
                                    {zoom !== 1 && (
                                        <button
                                            onClick={handleZoomReset}
                                            className="p-1.5 rounded hover:bg-[var(--accent-soft)] transition-colors ml-1"
                                            title="Reset zoom"
                                        >
                                            <Maximize2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                                    ✓ Preview - This is exactly what will be exported
                                </p>
                                {zoom > 1 && (
                                    <p className="text-[var(--accent)]">
                                        Drag to pan • Scroll to zoom
                                    </p>
                                )}
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {MARKET_COPY[marketplace].title} • {LABEL_SIZE_MM[marketplace].width}×{LABEL_SIZE_MM[marketplace].height} mm
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
