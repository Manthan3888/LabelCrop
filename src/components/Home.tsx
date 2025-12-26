import { Package, FileText, Layers } from 'lucide-react';
import { Link } from './Link';

export function Home() {
    const tools = [
        {
            name: 'Flipkart Label Crop',
            description: 'Automatically detect and crop Flipkart shipping labels with SKU auto-entry',
            icon: Package,
            href: '/flipkart',
            color: 'bg-yellow-500'
        },
        {
            name: 'Meesho Label Crop',
            description: 'Precise width/length measurements with SKU auto-population for Meesho',
            icon: Package,
            href: '/meesho',
            color: 'bg-pink-500'
        },
        {
            name: 'Amazon Label Crop',
            description: 'Automated cropping and resizing for Amazon shipping labels',
            icon: Package,
            href: '/amazon',
            color: 'bg-orange-500'
        },
        {
            name: 'Myntra Label Crop',
            description: 'Standard 4x6 inch label cropping for Myntra logistics',
            icon: Package,
            href: '/myntra',
            color: 'bg-rose-500'
        },
        {
            name: 'Snapdeal Label Crop',
            description: 'A6 size auto-crop optimized for Snapdeal labels',
            icon: Package,
            href: '/snapdeal',
            color: 'bg-red-500'
        },
        {
            name: 'PDF Merge',
            description: 'Consolidate multiple marketplace PDF labels in your specified order',
            icon: Layers,
            href: '/merge',
            color: 'bg-blue-500'
        }
    ];

    return (
        <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 20% 20%, var(--accent-soft), transparent 35%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.12), transparent 40%), var(--surface-muted)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 rounded-full accent-pill text-sm font-semibold mb-4">
                        Multi-marketplace label automation
                    </div>
                    <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                        Crop Label
                    </h1>
                    <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Streamline Flipkart, Meesho, and Amazon labels with one unified, animated workspace.
                        Automatic detection, precise cropping, and export-ready PDFs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {tools.map((tool) => (
                        <Link key={tool.name} href={tool.href}>
                            <div className="glass-card p-8 rounded-2xl cursor-pointer overflow-hidden" style={{ background: 'var(--surface)', minHeight: '180px' }}>
                                <div style={{ height: '100%' }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                                        <tool.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{tool.name}</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>{tool.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
                            One-Click Automation
                        </h2>
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Upload once, let us auto-detect label bounds, crop precisely, and export clean PDFs.
                            Works across Flipkart, Meesho, and Amazon with marketplace-aware sizing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
