import { MAX_MIN_DIGITS, MIN_MIN_DIGITS, renderCounter } from "../render";
import { messages, type Locale } from "../i18n";
import type { CounterState } from "../store";
import { defaultTheme, themeList, themes } from "../themes";
import {
    MAX_ALLOWED_DOMAINS_LENGTH,
    MAX_COUNT,
    MAX_CSS_LENGTH,
} from "../validate";
import { Layout } from "./layout";

export function EditorPage({
    locale,
    counterId,
    counter,
}: {
    locale: Locale;
    counterId: string;
    counter: CounterState;
}) {
    const t = messages[locale.lang];
    const savedTheme = themes[counter.theme] ?? defaultTheme;
    const hasCustomCss =
        counter.css.trim() !== "" &&
        counter.css.trim() !== savedTheme.css.trim();
    const savedPreview = renderCounter(counter.count, savedTheme, counter);
    return (
        <Layout
            locale={locale}
            title={t.editTitle}
            tagline={t.editTagline}
            page="edit"
            counterId={counterId}
        >
            <section class="preview-box">
                <p class="counter-caption">{t.previewCaption}</p>
                <img
                    id="preview"
                    alt={t.previewAlt}
                    src={`data:image/svg+xml,${encodeURIComponent(savedPreview)}`}
                />
            </section>

            <form id="counter-form" class="panel">
                <fieldset class="row">
                    <legend>{t.numbers}</legend>
                    <label>
                        {t.minDigits}
                        <input
                            type="number"
                            name="minDigits"
                            min={MIN_MIN_DIGITS}
                            max={MAX_MIN_DIGITS}
                            value={counter.minDigits}
                            required
                        />
                    </label>
                    <label>
                        {t.currentCount}
                        <input
                            type="number"
                            name="count"
                            min="0"
                            max={MAX_COUNT}
                            value={counter.count}
                            required
                        />
                    </label>
                </fieldset>

                <fieldset class="theme-picker">
                    <legend>{t.theme}</legend>
                    <div class="theme-grid">
                        {themeList.map((theme) => (
                            <label class="theme-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={theme.name}
                                    data-css={theme.css}
                                    checked={theme === savedTheme}
                                />
                                <img
                                    src={`/preview.svg?theme=${theme.name}`}
                                    alt=""
                                />
                                <span>{theme.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div class="customize">
                    <details open={hasCustomCss}>
                        <summary>{t.customizeTheme}</summary>
                        <textarea
                            name="css"
                            aria-label="CSS"
                            rows={14}
                            maxlength={MAX_CSS_LENGTH}
                            spellcheck={false}
                            autocapitalize="off"
                            autocorrect="off"
                        >
                            {counter.css || savedTheme.css}
                        </textarea>
                    </details>
                    <button
                        type="button"
                        id="reset-css"
                        class="text-button"
                        hidden={!hasCustomCss}
                    >
                        {t.resetStyles}
                    </button>
                </div>

                <fieldset>
                    <legend>{t.domainLock}</legend>
                    <label>
                        {t.allowedDomains}
                        <input
                            type="text"
                            name="allowedDomains"
                            placeholder="example.com, example.org"
                            value={counter.allowedDomains.replaceAll(" ", ", ")}
                            maxlength={MAX_ALLOWED_DOMAINS_LENGTH}
                            aria-describedby="allowed-domains-hint"
                            spellcheck={false}
                            autocapitalize="off"
                            autocorrect="off"
                        />
                    </label>
                    <p id="allowed-domains-hint" class="hint">
                        {t.allowedDomainsHint}
                    </p>
                </fieldset>

                <button type="submit" class="primary">
                    {t.saveChanges}
                </button>
                <p id="status" class="status" role="status" />
                <p id="reset-status" class="sr-only" role="status" />
            </form>

            <section class="panel">
                <h2>{t.yourCounter}</h2>
                <label>
                    {t.embedLabel}
                    <textarea
                        id="embed-code"
                        class="copyable"
                        rows={3}
                        readonly
                    />
                </label>
                <label>
                    {t.editLinkLabel}
                    <input
                        id="edit-link"
                        class="copyable"
                        type="text"
                        readonly
                    />
                </label>
                <p class="warning">{t.editLinkWarning}</p>
            </section>
        </Layout>
    );
}
