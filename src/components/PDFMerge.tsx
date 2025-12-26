import { useState } from 'react';
import { Upload, Download, Trash2, MoveUp, MoveDown, Layers } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface UploadedFile {
    id: string;
    file: File;
    name: string;
}

export function PDFMerge() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [processing, setProcessing] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(e.target.files || []);
        const pdfFiles = uploadedFiles.filter((file) => file.type === 'application/pdf');

        const newFiles: UploadedFile[] = pdfFiles.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
        }));

        setFiles([...files, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(files.filter((f) => f.id !== id));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= files.length) return;

        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        setFiles(newFiles);
    };

    const mergePDFs = async () => {
        if (files.length < 2) return;

        setProcessing(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const { file } of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `merged-labels-${Date.now()}.pdf`;
            a.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="py-12" style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-8 py-6" style={{ background: 'var(--accent)', color: '#fff' }}>
                        <div className="flex items-center space-x-3">
                            <Layers className="w-8 h-8" />
                            <div>
                                <h1 className="text-3xl font-bold">PDF Merge Tool</h1>
                                <p className="text-white/90 mt-1">Consolidate multiple PDF labels in your specified order</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8" style={{ background: 'var(--surface)' }}>
                        <div className="mb-8">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="pdf-upload"
                                />
                                <label
                                    htmlFor="pdf-upload"
                                    className="flex items-center justify-center w-full px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors"
                                    style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                                >
                                    <Upload className="w-8 h-8 mr-3" style={{ color: 'var(--text-muted)' }} />
                                    <div className="text-center">
                                        <span className="font-semibold block" style={{ color: 'var(--text)' }}>
                                            Upload PDF Files
                                        </span>
                                        <span className="text-sm">Select multiple files or drag them here</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
                                        Files to Merge ({files.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {files.map((fileItem, index) => (
                                            <div
                                                key={fileItem.id}
                                                className="flex items-center justify-between p-4 rounded-lg border"
                                                style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
                                            >
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <span className="text-sm font-semibold px-3 py-1 rounded" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="truncate" style={{ color: 'var(--text)' }}>{fileItem.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => moveFile(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        <MoveUp className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveFile(index, 'down')}
                                                        disabled={index === files.length - 1}
                                                        className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        <MoveDown className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFile(fileItem.id)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={mergePDFs}
                                    disabled={files.length < 2 || processing}
                                    className="w-full px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                                    style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                            Merging PDFs...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-6 h-6 mr-2" />
                                            Merge & Download PDF
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {files.length === 0 && (
                            <div className="text-center py-12">
                                <Layers className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--border)' }} />
                                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No files uploaded yet</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload at least 2 PDF files to merge</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>How it works:</h3>
                    <ol className="list-decimal list-inside space-y-1" style={{ color: 'var(--text-muted)' }}>
                        <li>Upload multiple PDF files containing your shipping labels.</li>
                        <li>Arrange them in your preferred order using the up/down arrows.</li>
                        <li>Click "Merge & Download PDF" to create a single consolidated file.</li>
                        <li>Print your merged labels for efficient order fulfillment.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
