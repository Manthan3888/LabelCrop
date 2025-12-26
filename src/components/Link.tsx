import type { ReactNode, MouseEvent } from 'react';

interface LinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export function Link({ href, children, className = '' }: Readonly<LinkProps>) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        globalThis.history?.pushState({}, '', href);
        globalThis.dispatchEvent?.(new PopStateEvent('popstate'));
    };

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
