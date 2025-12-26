import { CheckCircle2, Ruler, Sparkles, Shield, Upload } from 'lucide-react';

export function CropGuide() {
    const steps = [
        {
            title: 'Upload a PDF label',
            detail: 'We only read page 1. Images are not supported.',
            icon: Upload,
        },
        {
            title: 'Auto-detect bounds',
            detail: 'We scan for darker pixels to find the label edges and add safety padding.',
            icon: Shield,
        },
        {
            title: 'Marketplace sizing',
            detail: 'Flipkart 100×148 mm, Meesho 100×150 mm, Amazon 102×152 mm.',
            icon: Ruler,
        },
        {
            title: 'Preview and export',
            detail: 'We center and scale to the target size, then export a crisp PDF.',
            icon: Sparkles,
        },
    ];

    return (
        <div className="min-h-screen py-12" style={{ background: 'var(--surface-muted)', color: 'var(--text)' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-2">Crop Guide</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Use this checklist to get clean labels for Flipkart, Meesho, and Amazon.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {steps.map((step) => (
                        <div key={step.title} className="glass-card rounded-2xl p-6 flex gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>{step.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Tips for best results
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text)' }}>
                        <li>Upload the original PDF from the marketplace; avoid screenshots.</li>
                        <li>Ensure the label has clear contrast; avoid low-contrast scans.</li>
                        <li>We auto-crop only page 1. If you have multiple labels, use PDF Merge.</li>
                        <li>After export, print at 100% scale to preserve dimensions.</li>
                        <li>If preview looks blank, retry with dark theme and a fresh upload.</li>
                    </ul>
                </div>

                <div className="glass-card rounded-2xl p-6 mt-8 grid md:grid-cols-3 gap-4 text-sm" style={{ color: 'var(--text)' }}>
                    <div>
                        <h4 className="font-semibold mb-2">Sizes</h4>
                        <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                            <li>Flipkart: 100 × 148 mm</li>
                            <li>Meesho: 100 × 150 mm</li>
                            <li>Amazon: 102 × 152 mm</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Do</h4>
                        <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                            <li>Use marketplace PDFs (page 1).</li>
                            <li>Keep barcodes fully visible.</li>
                            <li>Check preview before export.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Don’t</h4>
                        <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                            <li>No images/screenshots.</li>
                            <li>No multi-page scans for crop.</li>
                            <li>No scaling in printer (print at 100%).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
