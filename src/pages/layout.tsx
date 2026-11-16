import type { Child } from "hono/jsx";

type LayoutProps = {
    title: string;
    tagline: string;
    page: "home" | "edit" | "not-found";
    counterId?: string;
    children: Child;
};

export function Layout({
    title,
    tagline,
    page,
    counterId,
    children,
}: LayoutProps) {
    return (
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>{title}</title>
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body data-page={page} data-counter-id={counterId}>
                <main>
                    <header>
                        <h1>
                            <a href="/">c001 c0un73rz</a>
                        </h1>
                        <p class="tagline">{tagline}</p>
                    </header>
                    {children}
                </main>
                <script src="/app.js" defer />
            </body>
        </html>
    );
}
