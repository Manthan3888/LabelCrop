export function Footer() {
    return (
        <footer className="mt-12 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Crafted for Flipkart, Meesho, and Amazon label workflows. PDF-only for accurate sizing.
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Need help? Open the Crop Guide for step-by-step tips.
                </div>
            </div>
        </footer>
    );
}
