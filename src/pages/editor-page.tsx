import { DEFAULT_MIN_DIGITS, MAX_MIN_DIGITS, MIN_MIN_DIGITS } from "../render";
import { defaultTheme, themeList } from "../themes";
import { MAX_COUNT, MAX_CSS_LENGTH } from "../validate";
import { Layout } from "./layout";

export function EditorPage({ counterId }: { counterId: string }) {
    return (
        <Layout
            title="c001 c0un73rz | Edit your counter"
            tagline="Change the look of your counter"
            page="edit"
            counterId={counterId}
        >
            <section class="preview-box">
                <p class="counter-caption">Counter preview</p>
                <img
                    id="preview"
                    alt="counter preview"
                    src={`/preview.svg?theme=${defaultTheme.name}`}
                />
            </section>

            <form id="counter-form" class="panel">
                <fieldset class="row">
                    <legend>Numbers</legend>
                    <label>
                        Minimum digits
                        <input
                            type="number"
                            name="minDigits"
                            min={MIN_MIN_DIGITS}
                            max={MAX_MIN_DIGITS}
                            value={DEFAULT_MIN_DIGITS}
                            required
                        />
                    </label>
                    <label>
                        Current count
                        <input
                            type="number"
                            name="count"
                            min="0"
                            max={MAX_COUNT}
                            value="0"
                            required
                        />
                    </label>
                </fieldset>

                <fieldset>
                    <legend>Theme</legend>
                    <div class="theme-grid">
                        {themeList.map((theme) => (
                            <label class="theme-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={theme.name}
                                    data-css={theme.css}
                                    checked={theme === defaultTheme}
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
                    <details>
                        <summary>Customize theme</summary>
                        <textarea
                            name="css"
                            aria-label="CSS"
                            rows={14}
                            maxlength={MAX_CSS_LENGTH}
                            spellcheck={false}
                            autocapitalize="off"
                            autocorrect="off"
                        >
                            {defaultTheme.css}
                        </textarea>
                    </details>
                    <button
                        type="button"
                        id="reset-css"
                        class="text-button"
                        hidden
                    >
                        Reset styles
                    </button>
                </div>

                <button type="submit" class="primary">
                    Save changes
                </button>
                <p id="status" class="status" role="status" />
                <p id="reset-status" class="sr-only" role="status" />
            </form>

            <section class="panel">
                <h2>Your counter</h2>
                <label>
                    Paste this where you want the counter
                    <textarea
                        id="embed-code"
                        class="copyable"
                        rows={3}
                        readonly
                    />
                </label>
                <label>
                    Your secret edit link
                    <input
                        id="edit-link"
                        class="copyable"
                        type="text"
                        readonly
                    />
                </label>
                <p class="warning">
                    Save the edit link. It is the only way to change this
                    counter later, and it cannot be recovered.
                </p>
            </section>
        </Layout>
    );
}
