import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { LabelCropTool } from './components/LabelCropTool';
import { PDFMerge } from './components/PDFMerge';
import { CropGuide } from './components/CropGuide';
import { Footer } from './components/Footer';

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
        switch (currentPath) {
            case '/':
                return <Home />;
            case '/flipkart':
                return <LabelCropTool marketplace="flipkart" />;
            case '/meesho':
                return <LabelCropTool marketplace="meesho" />;
            case '/amazon':
                return <LabelCropTool marketplace="amazon" />;
            case '/myntra':
                return <LabelCropTool marketplace="myntra" />;
            case '/snapdeal':
                return <LabelCropTool marketplace="snapdeal" />;
            case '/merge':
                return <PDFMerge />;
            case '/guide':
                return <CropGuide />;
            default:
                return <Home />;
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
