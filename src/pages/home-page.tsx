import { messages, type Locale } from "../i18n";
import { SITE_COUNTER_ID } from "../site-counter";
import { Layout } from "./layout";

export function HomePage({ locale }: { locale: Locale }) {
    const t = messages[locale.lang];
    return (
        <Layout
            locale={locale}
            title={t.homeTitle}
            tagline={t.homeTagline}
            page="home"
        >
            <section class="panel">
                <h2>{t.createHeading}</h2>
                <p>{t.createIntro}</p>
                <button type="button" id="create-counter" class="primary">
                    {t.createButton}
                </button>
                <p id="create-status" class="status" role="status" />
            </section>

            <form id="open-counter-form" class="panel">
                <h2>{t.openHeading}</h2>
                <label>
                    {t.openLabel}
                    <input
                        type="text"
                        name="reference"
                        required
                        autocomplete="off"
                        spellcheck={false}
                        placeholder="https://…/edit/abc123/…"
                    />
                </label>
                <button type="submit" class="primary">
                    {t.openButton}
                </button>
                <p id="open-status" class="status" role="status" />
            </form>

            <section class="site-counter">
                <p class="counter-caption">{t.visitors}</p>
                <img alt="" src={`/c/${SITE_COUNTER_ID}.svg`} />
            </section>
        </Layout>
    );
}
