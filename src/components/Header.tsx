import { useState } from 'react';
import { Scissors, Moon, Sun, Menu, X } from 'lucide-react';
import { Link } from './Link';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    accent: string;
    accents: { value: string; label: string }[];
    onAccentChange: (value: string) => void;
}

export function Header({ theme, onToggleTheme }: Readonly<HeaderProps>) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header
            className="border-b border-gray-200/60 sticky top-0 z-40 backdrop-blur"
            style={{ background: 'var(--surface)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center accent-pill">
                                <Scissors className="w-6 h-6" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
                                Crop Label
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm">
                        <Link href="/flipkart" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Flipkart
                        </Link>
                        <Link href="/meesho" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Meesho
                        </Link>
                        <Link href="/amazon" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Amazon
                        </Link>
                        <Link href="/myntra" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Myntra
                        </Link>
                        <Link href="/snapdeal" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Snapdeal
                        </Link>
                        <Link href="/merge" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Merge
                        </Link>
                        <Link href="/guide" className="text-white-700 hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                            Guide
                        </Link>
                        <button
                            onClick={onToggleTheme}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-[var(--accent)] transition"
                            aria-label="Toggle theme"
                            style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                        >
                            {theme === 'light' ? (
                                <>
                                    <Moon className="w-4 h-4" />
                                    <span className="text-sm hidden xl:inline">Dark</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-4 h-4" />
                                    <span className="text-sm hidden xl:inline">Light</span>
                                </>
                            )}
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            onClick={onToggleTheme}
                            className="p-2 rounded-lg border transition"
                            style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg border transition"
                            style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex flex-col gap-2 pt-4">
                            <Link 
                                href="/flipkart" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Flipkart Tool
                            </Link>
                            <Link 
                                href="/meesho" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Meesho Tool
                            </Link>
                            <Link 
                                href="/amazon" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Amazon Tool
                            </Link>
                            <Link 
                                href="/myntra" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Myntra Tool
                            </Link>
                            <Link 
                                href="/snapdeal" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Snapdeal Tool
                            </Link>
                            <Link 
                                href="/merge" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                PDF Merge
                            </Link>
                            <Link 
                                href="/guide" 
                                className="px-4 py-2 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                                style={{ color: 'var(--text)' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Crop Guide
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
