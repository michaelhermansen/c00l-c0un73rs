import { SITE_COUNTER_ID } from "../site-counter";
import { Layout } from "./layout";

export function HomePage() {
    return (
        <Layout
            title="c001 c0un73rz | Visitor counter for your web site"
            tagline="Get a cool visitor counter for your web site. No account needed."
            page="home"
        >
            <section class="panel">
                <h2>Create a new counter</h2>
                <p>
                    You get a counter right away and can pick a theme or write
                    your own CSS on the next page.
                </p>
                <button type="button" id="create-counter" class="primary">
                    Create new counter
                </button>
                <p id="create-status" class="status" role="status" />
            </section>

            <form id="open-counter-form" class="panel">
                <h2>Edit an existing counter</h2>
                <label>
                    Your edit link
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
                    Edit counter
                </button>
                <p id="open-status" class="status" role="status" />
            </form>

            <section class="site-counter">
                <p class="counter-caption">Number of visitors</p>
                <img alt="" src={`/c/${SITE_COUNTER_ID}.svg`} />
            </section>
        </Layout>
    );
}
