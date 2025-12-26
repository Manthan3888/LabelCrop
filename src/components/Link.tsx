import type { ReactNode, MouseEvent, CSSProperties } from 'react';

interface LinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

export function Link({ href, children, className = '', style, onClick }: Readonly<LinkProps>) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        globalThis.history?.pushState({}, '', href);
        globalThis.dispatchEvent?.(new PopStateEvent('popstate'));
        onClick?.();
    };

    return (
        <a href={href} onClick={handleClick} className={className} style={style}>
            {children}
        </a>
    );
}
