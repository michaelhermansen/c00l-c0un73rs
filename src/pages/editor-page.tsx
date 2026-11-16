import { DEFAULT_MIN_DIGITS, MAX_MIN_DIGITS, MIN_MIN_DIGITS } from "../render.ts";
import { defaultTheme, themeList } from "../themes/index.ts";
import { MAX_COUNT, MAX_CSS_LENGTH } from "../validate.ts";
import { Layout } from "./layout.tsx";

const CSS_CLASSES = [
    [".frame", "the outer box"],
    [".digit", 'one group per digit, has data-value="0" to "9"'],
    [".digit-bg", "the box behind each digit"],
    [".digit-text", "the digit as text"],
    [".segments", "the 7-segment display, hidden unless you show it"],
    [".seg.on, .seg.off", "lit and unlit segments (also .seg-a to .seg-g)"],
    [".digit-shade", "odometer-style shading, hidden unless you show it"],
];

export function EditorPage({ counterId }: { counterId: string }) {
    return (
        <Layout
            title="c001 c0un73rz | Edit your counter"
            tagline="Change the look of your counter."
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
                <fieldset>
                    <legend>Theme</legend>
                    <div class="theme-grid">
                        {themeList.map((theme) => (
                            <label class="theme-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={theme.name}
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

                <details>
                    <summary>Custom CSS</summary>
                    <p>Tweak the selected theme with your own CSS.</p>
                    <textarea
                        name="css"
                        rows={8}
                        maxlength={MAX_CSS_LENGTH}
                        spellcheck={false}
                        placeholder=".digit-text { fill: hotpink; }"
                    />
                    <table class="css-help">
                        <caption>Classes you can style</caption>
                        <tbody>
                            {CSS_CLASSES.map(([selector, description]) => (
                                <tr>
                                    <th scope="row">
                                        <code>{selector}</code>
                                    </th>
                                    <td>{description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </details>

                <button type="submit" class="primary">
                    Save changes
                </button>
                <p id="status" class="status" role="status" />
            </form>

            <section class="panel">
                <h2>Your counter</h2>
                <label>
                    Paste this where you want the counter
                    <textarea
                        id="embed-code"
                        class="copyable"
                        rows={2}
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
