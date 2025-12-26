import { Scissors, Moon, Sun, Palette } from 'lucide-react';
import { Link } from './Link';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    accent: string;
    accents: { value: string; label: string }[];
    onAccentChange: (value: string) => void;
}

export function Header({ theme, onToggleTheme, accent, accents, onAccentChange }: Readonly<HeaderProps>) {
    return (
        <header
            className="border-b border-gray-200/60 sticky top-0 z-40 backdrop-blur"
            style={{ background: 'var(--surface)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
                    <div className="flex items-center justify-between md:justify-start gap-4">
                        <Link href="/">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center accent-pill">
                                    <Scissors className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                                    Crop Label
                                </span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={onToggleTheme}
                                className="p-2 rounded-lg border transition"
                                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <nav className="flex flex-wrap items-center gap-6 text-sm">
                        <Link href="/flipkart" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Flipkart Tool
                        </Link>
                        <Link href="/meesho" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Meesho Tool
                        </Link>
                        <Link href="/amazon" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Amazon Tool
                        </Link>
                        <Link href="/myntra" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Myntra Tool
                        </Link>
                        <Link href="/snapdeal" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Snapdeal Tool
                        </Link>
                        <Link href="/merge" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            PDF Merge
                        </Link>
                        <Link href="/guide" className="text-white-700 hover:text-[var(--accent)] transition-colors">
                            Crop Guide
                        </Link>

                        <div className="flex items-center gap-3 ml-2">
                            <button
                                onClick={onToggleTheme}
                                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[var(--accent)] transition"
                                aria-label="Toggle theme"
                                style={{ color: 'var(--text)' }}
                            >
                                {theme === 'light' ? (
                                    <>
                                        <Moon className="w-4 h-4" />
                                        <span className="text-sm">Dark</span>
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-4 h-4" />
                                        <span className="text-sm">Light</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
