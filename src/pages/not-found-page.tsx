import { messages, type Locale } from "../i18n";
import { Layout } from "./layout";

export function NotFoundPage({ locale }: { locale: Locale }) {
    const t = messages[locale.lang];
    return (
        <Layout
            locale={locale}
            title={t.notFoundTitle}
            tagline={t.notFoundTagline}
            page="not-found"
        >
            <section class="panel">
                <h2>{t.notFoundHeading}</h2>
                <p>{t.notFoundText}</p>
                <p>
                    <a href={locale.prefix || "/"}>{t.backToFront}</a>
                </p>
            </section>
        </Layout>
    );
}
