export function Footer() {
    return (
        <footer className="mt-8 sm:mt-12 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
                    Crafted for Flipkart, Meesho, and Amazon label workflows. PDF-only for accurate sizing.
                </div>
                <div className="text-xs text-center md:text-right" style={{ color: 'var(--text-muted)' }}>
                    Need help? Open the Crop Guide for step-by-step tips.
                </div>
            </div>
        </footer>
    );
}
