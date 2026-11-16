import type { Child } from "hono/jsx";
import {
    HTML_LANG,
    LANG_NAMES,
    LANGS,
    messages,
    switchLangPath,
    type Locale,
} from "../i18n";

type LayoutProps = {
    locale: Locale;
    title: string;
    tagline: string;
    page: "home" | "edit" | "not-found";
    counterId?: string;
    children: Child;
};

export function Layout({
    locale,
    title,
    tagline,
    page,
    counterId,
    children,
}: LayoutProps) {
    const t = messages[locale.lang];
    return (
        <html lang={HTML_LANG[locale.lang]}>
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>{`c001 c0un73rz | ${title}`}</title>
                <link rel="stylesheet" href="/style.css" />
                {page === "edit" && (
                    <meta name="robots" content="noindex" />
                )}
                {page === "home" && (
                    <>
                        {LANGS.map((lang) => (
                            <link
                                rel="alternate"
                                hreflang={HTML_LANG[lang]}
                                href={
                                    locale.origin + switchLangPath(locale, lang)
                                }
                            />
                        ))}
                        <link
                            rel="alternate"
                            hreflang="x-default"
                            href={locale.origin + locale.path}
                        />
                    </>
                )}
            </head>
            <body
                data-page={page}
                data-counter-id={counterId}
                data-lang-prefix={locale.prefix}
                data-messages={JSON.stringify(t.client)}
            >
                <main>
                    <header>
                        <h1>
                            <a href={locale.prefix || "/"}>c001 c0un73rz</a>
                        </h1>
                        <p class="tagline">{tagline}</p>
                    </header>
                    {children}
                </main>
                <footer>
                    <p class="footer-notes">
                        {t.footerPrivacy} {t.footerTerms}
                    </p>
                    <nav class="languages" aria-label={t.languageLabel}>
                        {LANGS.map((lang) =>
                            lang === locale.lang ? (
                                <strong aria-current="true">
                                    {LANG_NAMES[lang]}
                                </strong>
                            ) : (
                                <a
                                    href={switchLangPath(locale, lang)}
                                    lang={HTML_LANG[lang]}
                                    hreflang={HTML_LANG[lang]}
                                >
                                    {LANG_NAMES[lang]}
                                </a>
                            ),
                        )}
                    </nav>
                    <p>
                        <a href="https://github.com/michaelhermansen/c00l-c0un73rs">
                            GitHub
                        </a>
                    </p>
                </footer>
                <script src="/app.js" defer />
            </body>
        </html>
    );
}
