import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home').then(m => ({ default: m.Home })));
const LabelCropTool = lazy(() => import('./components/LabelCropTool').then(m => ({ default: m.LabelCropTool })));
const PDFMerge = lazy(() => import('./components/PDFMerge').then(m => ({ default: m.PDFMerge })));
const CropGuide = lazy(() => import('./components/CropGuide').then(m => ({ default: m.CropGuide })));

function App() {
    const initialPath = globalThis.location ? globalThis.location.pathname : '/';
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [accent, setAccent] = useState('#10b981');

    useEffect(() => {
        const handlePopState = () => {
            if (globalThis.location) {
                setCurrentPath(globalThis.location.pathname);
            }
        };

        globalThis.addEventListener?.('popstate', handlePopState);
        return () => globalThis.removeEventListener?.('popstate', handlePopState);
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.setProperty('--accent', accent);
        // derive a stronger shade for borders/hover states
        document.documentElement.style.setProperty('--accent-strong', accent);
        document.documentElement.style.setProperty('--accent-soft', `${accent}1f`);
    }, [theme, accent]);

    const accentOptions = useMemo(
        () => [
            { value: '#10b981', label: 'Emerald' },
            { value: '#0ea5e9', label: 'Sky' },
            { value: '#22c55e', label: 'Green' },
            { value: '#f97316', label: 'Orange' },
            { value: '#a855f7', label: 'Purple' },
            { value: '#f59e0b', label: 'Amber' },
            { value: '#ef4444', label: 'Red' },
            { value: '#14b8a6', label: 'Teal' },
        ],
        []
    );

    const renderPage = () => {
        const LoadingFallback = () => (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-muted)' }}>
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );

        switch (currentPath) {
            case '/':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <Home />
                    </Suspense>
                );
            case '/flipkart':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <LabelCropTool marketplace="flipkart" />
                    </Suspense>
                );
            case '/meesho':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <LabelCropTool marketplace="meesho" />
                    </Suspense>
                );
            case '/amazon':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <LabelCropTool marketplace="amazon" />
                    </Suspense>
                );
            case '/myntra':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <LabelCropTool marketplace="myntra" />
                    </Suspense>
                );
            case '/snapdeal':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <LabelCropTool marketplace="snapdeal" />
                    </Suspense>
                );
            case '/merge':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <PDFMerge />
                    </Suspense>
                );
            case '/guide':
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <CropGuide />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<LoadingFallback />}>
                        <Home />
                    </Suspense>
                );
        }
    };

    return (
        <div
            className="min-h-screen theme-shell"
            style={{
                background: 'var(--surface-muted)',
                color: 'var(--text)'
            }}
        >
            <Header
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                accent={accent}
                accents={accentOptions}
                onAccentChange={setAccent}
            />
            {renderPage()}
            <Footer />
        </div>
    );
}

export default App;
