import { Layout } from "./layout.tsx";

export function NotFoundPage() {
    return (
        <Layout
            title="c001 c0un73rz | Not found"
            tagline="404 not found"
            page="not-found"
        >
            <section class="panel">
                <h2>Nothing here</h2>
                <p>
                    This page or counter does not exist. Check the link, or
                    start over from the front page.
                </p>
                <p>
                    <a href="/">Back to the front page</a>
                </p>
            </section>
        </Layout>
    );
}
